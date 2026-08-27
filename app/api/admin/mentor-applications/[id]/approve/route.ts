import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requirePermission("mentors.approve");
    const { id } = await params;

    const mentor = await prisma.mentorProfile.findUnique({ where: { id } });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor application not found" }, { status: 404 });
    }
    if (mentor.status === "ACTIVE") {
      return NextResponse.json({ error: "Mentor is already active" }, { status: 400 });
    }

    const updated = await prisma.mentorProfile.update({
      where: { id },
      data: { status: "ACTIVE", reviewedById: admin.id, reviewedAt: new Date(), rejectionReason: null },
    });

    await recordAuditLog({
      actorId: admin.id,
      action: "MENTOR_APPROVED",
      resourceType: "MentorProfile",
      resourceId: id,
    });

    return NextResponse.json({ mentor: { id: updated.id, status: updated.status } });
  } catch (error) {
    return errorResponse(error);
  }
}
