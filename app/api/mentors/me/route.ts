import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { updateMentorProfileSchema } from "@/lib/validation/profile";
import { errorResponse } from "@/lib/api/respond";

const include = {
  user: { select: { name: true, email: true, avatarUrl: true } },
  subjects: { select: { slug: true, name: true } },
  grades: { select: { slug: true, name: true } },
} as const;

async function loadProfile(userId: string) {
  return prisma.mentorProfile.findUniqueOrThrow({ where: { userId }, include });
}

function toDto(profile: Awaited<ReturnType<typeof loadProfile>>) {
  return {
    name: profile.user.name,
    email: profile.user.email,
    avatarUrl: profile.user.avatarUrl,
    status: profile.status,
    bio: profile.bio ?? "",
    qualifications: profile.qualifications ?? "",
    teachingStyle: profile.teachingStyle ?? "",
    subjects: profile.subjects,
    grades: profile.grades,
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
    const { subjectSlugs, gradeSlugs, ...rest } = body;

    if (subjectSlugs) {
      const found = await prisma.subject.count({ where: { slug: { in: subjectSlugs } } });
      if (found !== subjectSlugs.length) {
        return NextResponse.json({ error: "One or more subjects were not recognized" }, { status: 400 });
      }
    }
    if (gradeSlugs) {
      const found = await prisma.grade.count({ where: { slug: { in: gradeSlugs } } });
      if (found !== gradeSlugs.length) {
        return NextResponse.json({ error: "One or more grades were not recognized" }, { status: 400 });
      }
    }

    const profile = await prisma.mentorProfile.update({
      where: { userId: user.id },
      data: {
        ...rest,
        ...(subjectSlugs ? { subjects: { set: subjectSlugs.map((slug) => ({ slug })) } } : {}),
        ...(gradeSlugs ? { grades: { set: gradeSlugs.map((slug) => ({ slug })) } } : {}),
      },
      include,
    });

    return NextResponse.json({ profile: toDto(profile) });
  } catch (error) {
    return errorResponse(error);
  }
}
