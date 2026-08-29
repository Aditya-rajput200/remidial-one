import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";

/** Upcoming/live/completed assessments assigned to the current student, grouped client-side by status/dates. */
export async function GET() {
  try {
    const user = await requireRole("STUDENT");
    const studentProfile = await prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } });

    const assignments = await prisma.assessmentAssignment.findMany({
      where: {
        studentId: studentProfile.id,
        // DRAFT/REVIEW are still being built — a student is assigned but
        // shouldn't see the test exists until it's at least scheduled.
        assessment: { status: { notIn: ["DRAFT", "REVIEW", "ARCHIVED"] } },
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            durationMinutes: true,
            totalMarks: true,
            startAt: true,
            endAt: true,
            subject: { select: { name: true } },
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    const attempts = await prisma.studentAssessment.findMany({
      where: { studentId: studentProfile.id },
      select: { assessmentId: true, id: true, status: true, attemptNumber: true },
    });

    return NextResponse.json({
      assessments: assignments.map((a) => ({
        ...a.assessment,
        attempts: attempts.filter((att) => att.assessmentId === a.assessment.id),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
