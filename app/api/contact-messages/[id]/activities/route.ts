import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { logLeadActivitySchema } from "@/lib/validation/leads";

// Same as app/api/counselling-requests/[id]/activities, for ContactMessage.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requirePermission("support.manage");
    const { id } = await params;
    const body = logLeadActivitySchema.parse(await request.json());

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Contact message not found" }, { status: 404 });
    }

    const [activity] = await prisma.$transaction([
      prisma.contactMessageActivity.create({
        data: {
          messageId: id,
          authorId: admin.id,
          outcome: body.outcome,
          note: body.note,
          nextFollowUpAt: body.nextFollowUpAt,
        },
        include: { author: { select: { name: true } } },
      }),
      prisma.contactMessage.update({
        where: { id },
        data: {
          nextFollowUpAt: body.nextFollowUpAt ?? null,
          ...(body.status ? { status: body.status } : {}),
        },
      }),
    ]);

    await recordAuditLog({
      actorId: admin.id,
      action: "ADMIN_CONTACT_MESSAGE_ACTIVITY_LOGGED",
      resourceType: "ContactMessage",
      resourceId: id,
      metadata: { outcome: body.outcome, nextFollowUpAt: body.nextFollowUpAt?.toISOString(), status: body.status },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
