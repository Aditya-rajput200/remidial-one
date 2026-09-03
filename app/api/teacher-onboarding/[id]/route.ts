import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission, userHasPermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { onboardingDetailInclude, onboardingDetailDto, loadOnboardingTimeline } from "@/lib/teacher/access";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("teacher_onboarding.read");
    const { id } = await params;

    const profile = await prisma.mentorProfile.findUnique({
      where: { id },
      include: onboardingDetailInclude,
    });
    if (!profile) return NextResponse.json({ error: "Applicant not found" }, { status: 404 });

    const timeline = await loadOnboardingTimeline(profile.id, profile.lead?.id);
    const canVerify = await userHasPermission(actor, "teacher_onboarding.verify");
    const canManage = await userHasPermission(actor, "teacher_onboarding.manage");

    return NextResponse.json({
      applicant: onboardingDetailDto(profile),
      activity: timeline,
      can: { verify: canVerify, manage: canManage },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
