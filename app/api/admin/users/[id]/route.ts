import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission, getEffectivePermissions } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { updateUserAccessSchema } from "@/lib/validation/users";
import { ALL_PERMISSION_KEYS, type PermissionKey } from "@/lib/auth/permissions";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("users.read");
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        userPermissions: {
          select: {
            id: true,
            effect: true,
            reason: true,
            createdAt: true,
            permission: { select: { key: true, description: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const effectivePermissions = Array.from(await getEffectivePermissions(user.id, user.role)).sort();

    return NextResponse.json({ user, effectivePermissions });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requirePermission("roles.manage");
    const { id } = await params;
    const body = updateUserAccessSchema.parse(await request.json());

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.action === "change_role") {
      // Changing your own role could lock you out of roles.manage itself
      // (or anything else) with no one else able to undo it from the UI —
      // have another Super Admin do it instead.
      if (id === admin.id) {
        return NextResponse.json({ error: "You can't change your own role here." }, { status: 400 });
      }

      const updated = await prisma.user.update({ where: { id }, data: { role: body.role } });
      await recordAuditLog({
        actorId: admin.id,
        action: "ADMIN_USER_ROLE_CHANGED",
        resourceType: "User",
        resourceId: id,
        metadata: { from: target.role, to: body.role },
      });
      return NextResponse.json({ user: { id: updated.id, role: updated.role } });
    }

    if (body.action === "remove_override") {
      if (!ALL_PERMISSION_KEYS.includes(body.permissionKey as PermissionKey)) {
        return NextResponse.json({ error: "Unknown permission key" }, { status: 400 });
      }
      const permission = await prisma.permission.findUnique({ where: { key: body.permissionKey } });
      if (!permission) {
        return NextResponse.json({ error: "Unknown permission key" }, { status: 400 });
      }
      await prisma.userPermission.deleteMany({ where: { userId: id, permissionId: permission.id } });
      await recordAuditLog({
        actorId: admin.id,
        action: "ADMIN_USER_PERMISSION_OVERRIDE_REMOVED",
        resourceType: "User",
        resourceId: id,
        metadata: { permissionKey: body.permissionKey },
      });
      return NextResponse.json({ ok: true });
    }

    // grant_permission / revoke_permission
    if (!ALL_PERMISSION_KEYS.includes(body.permissionKey as PermissionKey)) {
      return NextResponse.json({ error: "Unknown permission key" }, { status: 400 });
    }
    const permission = await prisma.permission.findUnique({ where: { key: body.permissionKey } });
    if (!permission) {
      return NextResponse.json({ error: "Unknown permission key" }, { status: 400 });
    }

    const effect = body.action === "grant_permission" ? "GRANT" : "REVOKE";
    const override = await prisma.userPermission.upsert({
      where: { userId_permissionId: { userId: id, permissionId: permission.id } },
      create: { userId: id, permissionId: permission.id, effect, reason: body.reason, grantedById: admin.id },
      update: { effect, reason: body.reason, grantedById: admin.id },
    });

    await recordAuditLog({
      actorId: admin.id,
      action: effect === "GRANT" ? "ADMIN_USER_PERMISSION_GRANTED" : "ADMIN_USER_PERMISSION_REVOKED",
      resourceType: "User",
      resourceId: id,
      metadata: { permissionKey: body.permissionKey, reason: body.reason },
    });

    return NextResponse.json({ override });
  } catch (error) {
    return errorResponse(error);
  }
}
