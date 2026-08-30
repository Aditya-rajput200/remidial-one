import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { logLeadActivitySchema } from "@/lib/validation/leads";

// Logs one follow-up attempt (a call, an email, etc.) as an append-only
// entry — never overwrites past history the way a single notes field would.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requirePermission("support.manage");
    const { id } = await params;
    const body = logLeadActivitySchema.parse(await request.json());

    const existing = await prisma.counsellingRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Counselling request not found" }, { status: 404 });
    }

    const [activity] = await prisma.$transaction([
      prisma.counsellingRequestActivity.create({
        data: {
          requestId: id,
          authorId: admin.id,
          outcome: body.outcome,
          note: body.note,
          nextFollowUpAt: body.nextFollowUpAt,
        },
        include: { author: { select: { name: true } } },
      }),
      prisma.counsellingRequest.update({
        where: { id },
        data: {
          nextFollowUpAt: body.nextFollowUpAt ?? null,
          ...(body.status ? { status: body.status } : {}),
          ...(body.status === "CONTACTED" && !existing.contactedAt ? { contactedAt: new Date() } : {}),
        },
      }),
    ]);

    await recordAuditLog({
      actorId: admin.id,
      action: "ADMIN_COUNSELLING_REQUEST_ACTIVITY_LOGGED",
      resourceType: "CounsellingRequest",
      resourceId: id,
      metadata: { outcome: body.outcome, nextFollowUpAt: body.nextFollowUpAt?.toISOString(), status: body.status },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
