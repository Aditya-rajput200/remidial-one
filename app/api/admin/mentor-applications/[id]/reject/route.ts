import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

const schema = z.object({ reason: z.string().trim().min(1, "A reason is required").max(1000) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requirePermission("mentors.approve");
    const { id } = await params;
    const body = schema.parse(await request.json());

    const mentor = await prisma.mentorProfile.findUnique({ where: { id } });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor application not found" }, { status: 404 });
    }

    const updated = await prisma.mentorProfile.update({
      where: { id },
      data: { status: "REJECTED", reviewedById: admin.id, reviewedAt: new Date(), rejectionReason: body.reason },
    });

    await recordAuditLog({
      actorId: admin.id,
      action: "MENTOR_REJECTED",
      resourceType: "MentorProfile",
      resourceId: id,
      metadata: { reason: body.reason },
    });

    return NextResponse.json({ mentor: { id: updated.id, status: updated.status } });
  } catch (error) {
    return errorResponse(error);
  }
}
