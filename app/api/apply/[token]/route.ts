import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/respond";
import { teacherOnboardingFormSchema } from "@/lib/validation/teacher";
import { resolveApplicationToken } from "@/lib/teacher/application-token";
import { selfOnboardingInclude, selfOnboardingDto, applyOnboardingForm } from "@/lib/teacher/onboarding-form";

// No-login application form, reached via the prefilled link generated on the
// admin Leads page. The unguessable token is the only credential.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const profile = await resolveApplicationToken(token, selfOnboardingInclude);
    if (!profile) return NextResponse.json({ error: "This application link is invalid or has expired" }, { status: 404 });
    return NextResponse.json({ onboarding: selfOnboardingDto(profile) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = teacherOnboardingFormSchema.parse(await request.json());

    const profile = await resolveApplicationToken(token, { user: { select: { id: true, name: true } } });
    if (!profile) return NextResponse.json({ error: "This application link is invalid or has expired" }, { status: 404 });

    const result = await applyOnboardingForm({
      mentorProfileId: profile.id,
      currentStatus: profile.status,
      formSubmittedAlready: !!profile.onboardingFormSubmittedAt,
      actorName: profile.user.name,
      actorId: profile.user.id,
      body,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.httpStatus });

    return NextResponse.json({ ok: true, status: result.status });
  } catch (error) {
    return errorResponse(error);
  }
}
