import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { teacherOnboardingFormSchema } from "@/lib/validation/teacher";
import { selfOnboardingInclude, selfOnboardingDto, applyOnboardingForm } from "@/lib/teacher/onboarding-form";

export async function GET() {
  try {
    const user = await requireRole("MENTOR");
    const profile = await prisma.mentorProfile.findUnique({
      where: { userId: user.id },
      include: selfOnboardingInclude,
    });
    if (!profile) return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
    return NextResponse.json({ onboarding: selfOnboardingDto(profile) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole("MENTOR");
    const body = teacherOnboardingFormSchema.parse(await request.json());

    const profile = await prisma.mentorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, status: true, onboardingFormSubmittedAt: true },
    });
    if (!profile) return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });

    const result = await applyOnboardingForm({
      mentorProfileId: profile.id,
      currentStatus: profile.status,
      formSubmittedAlready: !!profile.onboardingFormSubmittedAt,
      actorName: user.name,
      actorId: user.id,
      body,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.httpStatus });

    return NextResponse.json({ ok: true, status: result.status });
  } catch (error) {
    return errorResponse(error);
  }
}
