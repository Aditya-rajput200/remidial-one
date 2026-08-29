import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { buildPublishedSnapshot, computeAssessmentTotalMarks } from "@/lib/assessment/lifecycle";
import { updateAssessmentSchema, assignStudentsSchema } from "@/lib/validation/assessment";
import type { Assessment, AssessmentStatus } from "@/lib/generated/prisma/client";

const builderInclude = {
  subject: { select: { slug: true, name: true } },
  assignments: { include: { student: { select: { id: true, user: { select: { name: true } } } } } },
  modules: {
    orderBy: { order: "asc" as const },
    include: { questions: { orderBy: { order: "asc" as const }, include: { question: true } } },
  },
} as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await loadOwnedAssessment(id, user);
    const assessment = await prisma.assessment.findUniqueOrThrow({ where: { id }, include: builderInclude });
    return NextResponse.json({ assessment });
  } catch (error) {
    return errorResponse(error);
  }
}

const patchSchema = z.discriminatedUnion("action", [
  updateAssessmentSchema.extend({ action: z.literal("update") }),
  z.object({ action: z.literal("schedule"), startAt: z.coerce.date(), endAt: z.coerce.date() }),
  assignStudentsSchema.extend({ action: z.literal("assign") }),
  assignStudentsSchema.extend({ action: z.literal("unassign") }),
  z.object({ action: z.literal("review") }),
  z.object({ action: z.literal("publish") }),
  z.object({ action: z.literal("pause") }),
  z.object({ action: z.literal("resume") }),
  z.object({ action: z.literal("end") }),
  z.object({ action: z.literal("archive") }),
]);

function requireStatus(assessment: Pick<Assessment, "status">, allowed: AssessmentStatus[]) {
  if (!allowed.includes(assessment.status)) {
    return NextResponse.json(
      { error: `Cannot perform this action while the assessment is ${assessment.status}` },
      { status: 400 },
    );
  }
  return null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { assessment: current, isModerator } = await loadOwnedAssessment(id, user);
    await assertCanModify(isModerator, user);

    const body = patchSchema.parse(await request.json());

    switch (body.action) {
      case "update": {
        const statusCheck = requireStatus(current, ["DRAFT", "REVIEW"]);
        if (statusCheck) return statusCheck;
        const { action, ...data } = body;
        void action;
        const assessment = await prisma.assessment.update({ where: { id }, data });
        return NextResponse.json({ assessment });
      }

      case "schedule": {
        const statusCheck = requireStatus(current, ["DRAFT", "REVIEW"]);
        if (statusCheck) return statusCheck;
        if (body.endAt.getTime() <= body.startAt.getTime()) {
          return NextResponse.json({ error: "endAt must be after startAt" }, { status: 400 });
        }
        const assessment = await prisma.assessment.update({
          where: { id },
          data: { startAt: body.startAt, endAt: body.endAt, status: "SCHEDULED" },
        });
        return NextResponse.json({ assessment });
      }

      case "review": {
        const statusCheck = requireStatus(current, ["DRAFT"]);
        if (statusCheck) return statusCheck;
        const assessment = await prisma.assessment.update({ where: { id }, data: { status: "REVIEW" } });
        return NextResponse.json({ assessment });
      }

      case "assign": {
        const studentProfiles = await prisma.studentProfile.findMany({ where: { id: { in: body.studentIds } } });
        await prisma.assessmentAssignment.createMany({
          data: studentProfiles.map((s) => ({ assessmentId: id, studentId: s.id })),
          skipDuplicates: true,
        });
        const assessment = await prisma.assessment.findUniqueOrThrow({ where: { id }, include: builderInclude });
        await recordAuditLog({
          actorId: user.id,
          action: "ASSESSMENT_STUDENTS_ASSIGNED",
          resourceType: "Assessment",
          resourceId: id,
          metadata: { studentIds: body.studentIds },
        });
        return NextResponse.json({ assessment });
      }

      case "unassign": {
        await prisma.assessmentAssignment.deleteMany({ where: { assessmentId: id, studentId: { in: body.studentIds } } });
        const assessment = await prisma.assessment.findUniqueOrThrow({ where: { id }, include: builderInclude });
        return NextResponse.json({ assessment });
      }

      case "publish": {
        const statusCheck = requireStatus(current, ["DRAFT", "REVIEW", "SCHEDULED"]);
        if (statusCheck) return statusCheck;

        const moduleCount = await prisma.assessmentModuleQuestion.count({ where: { module: { assessmentId: id } } });
        if (moduleCount === 0) {
          return NextResponse.json({ error: "Add at least one question before publishing" }, { status: 400 });
        }

        const totalMarks = await computeAssessmentTotalMarks(id);
        const publishedSnapshot = await buildPublishedSnapshot(id);
        const assessment = await prisma.assessment.update({
          where: { id },
          data: { status: "LIVE", totalMarks, publishedSnapshot },
        });

        await recordAuditLog({ actorId: user.id, action: "ASSESSMENT_PUBLISHED", resourceType: "Assessment", resourceId: id });
        return NextResponse.json({ assessment });
      }

      case "pause": {
        const statusCheck = requireStatus(current, ["LIVE"]);
        if (statusCheck) return statusCheck;
        const assessment = await prisma.assessment.update({ where: { id }, data: { status: "PAUSED" } });
        await recordAuditLog({ actorId: user.id, action: "ASSESSMENT_PAUSED", resourceType: "Assessment", resourceId: id });
        return NextResponse.json({ assessment });
      }

      case "resume": {
        const statusCheck = requireStatus(current, ["PAUSED"]);
        if (statusCheck) return statusCheck;
        const assessment = await prisma.assessment.update({ where: { id }, data: { status: "LIVE" } });
        return NextResponse.json({ assessment });
      }

      case "end": {
        const statusCheck = requireStatus(current, ["LIVE", "PAUSED"]);
        if (statusCheck) return statusCheck;

        const pendingCount = await prisma.evaluation.count({
          where: { status: { in: ["PENDING", "AI_SUGGESTED"] }, questionAttempt: { studentAssessment: { assessmentId: id } } },
        });
        const assessment = await prisma.assessment.update({
          where: { id },
          data: { status: pendingCount > 0 ? "EVALUATION" : "RESULT_READY" },
        });
        await recordAuditLog({ actorId: user.id, action: "ASSESSMENT_ENDED", resourceType: "Assessment", resourceId: id });
        return NextResponse.json({ assessment });
      }

      case "archive": {
        const statusCheck = requireStatus(current, ["DRAFT", "ENDED", "RESULT_READY"]);
        if (statusCheck) return statusCheck;
        const assessment = await prisma.assessment.update({ where: { id }, data: { status: "ARCHIVED" } });
        await recordAuditLog({ actorId: user.id, action: "ASSESSMENT_ARCHIVED", resourceType: "Assessment", resourceId: id });
        return NextResponse.json({ assessment });
      }
    }
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { assessment } = await loadOwnedAssessment(id, user);
    if (assessment.status !== "DRAFT") {
      return NextResponse.json({ error: "Only draft assessments can be deleted" }, { status: 400 });
    }
    await prisma.assessment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
