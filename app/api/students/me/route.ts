import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { updateStudentProfileSchema } from "@/lib/validation/profile";
import { errorResponse } from "@/lib/api/respond";

async function loadProfile(userId: string) {
  return prisma.studentProfile.findUniqueOrThrow({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  });
}

function toDto(profile: Awaited<ReturnType<typeof loadProfile>>) {
  return {
    name: profile.user.name,
    email: profile.user.email,
    grade: profile.grade ?? "",
    curriculum: profile.curriculum ?? "",
    subjectsOfInterest: profile.subjectsOfInterest,
    learningGoals: profile.learningGoals ?? "",
    preferredTime: profile.preferredTime ?? "",
  };
}

export async function GET() {
  try {
    const user = await requireRole("STUDENT");
    const profile = await loadProfile(user.id);
    return NextResponse.json({ profile: toDto(profile) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole("STUDENT");
    const body = updateStudentProfileSchema.parse(await request.json());

    const profile = await prisma.studentProfile.update({
      where: { userId: user.id },
      data: body,
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ profile: toDto(profile) });
  } catch (error) {
    return errorResponse(error);
  }
}
