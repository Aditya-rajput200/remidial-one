import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { updateMentorProfileSchema } from "@/lib/validation/profile";
import { errorResponse } from "@/lib/api/respond";

async function loadProfile(userId: string) {
  return prisma.mentorProfile.findUniqueOrThrow({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  });
}

function toDto(profile: Awaited<ReturnType<typeof loadProfile>>) {
  return {
    name: profile.user.name,
    email: profile.user.email,
    status: profile.status,
    bio: profile.bio ?? "",
    qualifications: profile.qualifications ?? "",
    teachingStyle: profile.teachingStyle ?? "",
    subjectsTaught: profile.subjectsTaught,
    classesTaught: profile.classesTaught,
    languages: profile.languages,
    yearsExperience: profile.yearsExperience,
  };
}

export async function GET() {
  try {
    const user = await requireRole("MENTOR");
    const profile = await loadProfile(user.id);
    return NextResponse.json({ profile: toDto(profile) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole("MENTOR");
    const body = updateMentorProfileSchema.parse(await request.json());

    const profile = await prisma.mentorProfile.update({
      where: { userId: user.id },
      data: body,
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ profile: toDto(profile) });
  } catch (error) {
    return errorResponse(error);
  }
}
