import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("students.read");
    const { id } = await params;

    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, status: true, createdAt: true, timezone: true, country: true } },
        bookings: {
          take: 20,
          orderBy: { scheduledAt: "desc" },
          include: { subject: { select: { name: true } }, mentor: { select: { user: { select: { name: true } } } } },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    return errorResponse(error);
  }
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("suspend"), reason: z.string().trim().min(1, "A reason is required").max(1000) }),
  z.object({ action: z.literal("reactivate") }),
]);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requirePermission("students.manage");
    const { id } = await params;
    const body = patchSchema.parse(await request.json());

    const student = await prisma.studentProfile.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const status = body.action === "suspend" ? "SUSPENDED" : "ACTIVE";
    await prisma.user.update({ where: { id: student.userId }, data: { status } });

    await recordAuditLog({
      actorId: admin.id,
      action: body.action === "suspend" ? "STUDENT_SUSPENDED" : "STUDENT_REACTIVATED",
      resourceType: "StudentProfile",
      resourceId: id,
      metadata: body.action === "suspend" ? { reason: body.reason } : undefined,
    });

    return NextResponse.json({ student: { id, status } });
  } catch (error) {
    return errorResponse(error);
  }
}
