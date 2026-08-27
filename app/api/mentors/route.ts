import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/api/respond";
import type { Prisma } from "@/lib/generated/prisma/client";

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const publicSelect = {
  id: true,
  bio: true,
  qualifications: true,
  teachingStyle: true,
  languages: true,
  hourlyRate: true,
  currency: true,
  yearsExperience: true,
  user: { select: { name: true } },
  subjects: { select: { slug: true, name: true } },
  grades: { select: { slug: true, name: true } },
} satisfies Prisma.MentorProfileSelect;

// Public mentor discovery — only ACTIVE mentors are visible. Never exposes
// email or other account fields; those live behind /api/admin/mentors
// (Phase 8) or the mentor's own /api/mentors/me.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const subjectSlug = searchParams.get("subject") ?? undefined;
    const gradeSlug = searchParams.get("grade") ?? undefined;
    const q = searchParams.get("q")?.trim();
    const limit = Math.min(Number(searchParams.get("limit")) || PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

    const where: Prisma.MentorProfileWhereInput = {
      status: "ACTIVE",
      ...(subjectSlug ? { subjects: { some: { slug: subjectSlug } } } : {}),
      ...(gradeSlug ? { grades: { some: { slug: gradeSlug } } } : {}),
      ...(q ? { user: { name: { contains: q, mode: "insensitive" } } } : {}),
    };

    const [mentors, total] = await prisma.$transaction([
      prisma.mentorProfile.findMany({
        where,
        select: publicSelect,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.mentorProfile.count({ where }),
    ]);

    return NextResponse.json({
      mentors: mentors.map((m) => ({ ...m, name: m.user.name, user: undefined })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
