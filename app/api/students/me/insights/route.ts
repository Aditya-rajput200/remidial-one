import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { computeStudentStats } from "@/lib/stats/studentStats";
import { generateStudentInsight } from "@/lib/ai/nvidia";

// Recomputes stats from the database rather than trusting a client-supplied
// payload — the numbers here are fed straight into an LLM prompt, so this
// keeps a malicious client from injecting arbitrary prompt content.
export async function POST() {
  try {
    const user = await requireRole("STUDENT");
    const studentProfile = await prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } });

    const bookings = await prisma.booking.findMany({
      where: { studentId: studentProfile.id, status: "COMPLETED" },
      select: {
        id: true,
        scheduledAt: true,
        mentorRating: true,
        subject: { select: { slug: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    const stats = computeStudentStats(
      bookings.map((b) => ({
        id: b.id,
        date: b.scheduledAt.toISOString(),
        subjectSlug: b.subject.slug,
        subjectName: b.subject.name,
        mentorRating: b.mentorRating,
      }))
    );

    if (stats.ratedSessions === 0) {
      return NextResponse.json({ insight: null, reason: "no_data" });
    }

    const prompt = JSON.stringify({
      totalSessions: stats.totalSessions,
      ratedSessions: stats.ratedSessions,
      averageScoreOutOf10: stats.averageScore,
      recentTrendDelta: stats.recentTrendDelta,
      bySubject: stats.bySubject,
    });

    const result = await generateStudentInsight(prompt);
    if (!result.ok) {
      return NextResponse.json({ insight: null, reason: result.reason });
    }

    return NextResponse.json({ insight: result.insight });
  } catch (error) {
    return errorResponse(error);
  }
}
