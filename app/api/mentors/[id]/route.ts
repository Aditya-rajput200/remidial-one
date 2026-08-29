import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/api/respond";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const mentor = await prisma.mentorProfile.findFirst({
      where: { id, status: "ACTIVE" },
      select: {
        id: true,
        bio: true,
        qualifications: true,
        teachingStyle: true,
        languages: true,
        hourlyRate: true,
        currency: true,
        yearsExperience: true,
        user: { select: { name: true, avatarUrl: true } },
        subjects: { select: { slug: true, name: true } },
        grades: { select: { slug: true, name: true } },
      },
    });

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    return NextResponse.json({
      mentor: { ...mentor, name: mentor.user.name, avatarUrl: mentor.user.avatarUrl, user: undefined },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
