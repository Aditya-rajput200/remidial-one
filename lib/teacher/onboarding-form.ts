import "server-only";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { recordAuditLog } from "@/lib/audit/log";
import { completeStage } from "@/lib/teacher/onboarding";
import {
  computeProfileCompletion,
  stageTimelineDto,
  missingRequiredApplicationFields,
  REQUIRED_DOC_TYPES,
  REQUIRED_DOC_LABELS,
} from "@/lib/teacher/constants";
import type { TeacherDocumentType } from "@/lib/generated/prisma/enums";
import { notifyPermissionHolders } from "@/lib/notifications/create";
import type { z } from "zod";
import type { teacherOnboardingFormSchema } from "@/lib/validation/teacher";

export const selfOnboardingInclude = {
  subjects: { select: { slug: true, name: true } },
  grades: { select: { slug: true, name: true } },
  onboardingStages: true,
  documents: { orderBy: { createdAt: "desc" } },
  counselingSessions: { orderBy: { createdAt: "desc" }, take: 5 },
  demos: { orderBy: { createdAt: "desc" }, take: 5 },
  techAssessment: true,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.MentorProfileInclude;

export type SelfProfile = Prisma.MentorProfileGetPayload<{ include: typeof selfOnboardingInclude }>;

// Applicant-facing view — omits internal admin notes, evaluator comments,
// ratings, recommendations. Shared by /api/mentors/me/onboarding and
// /api/apply/<token>.
export function selfOnboardingDto(p: SelfProfile) {
  const { percent, missing } = computeProfileCompletion(p);
  return {
    id: p.id,
    status: p.status,
    applicant: { name: p.user.name, email: p.user.email },
    onboardingFormSubmittedAt: p.onboardingFormSubmittedAt,
    onboardedAt: p.onboardedAt,
    rejectionReason: p.status === "REJECTED" || p.status === "NEEDS_CORRECTION" ? p.rejectionReason : null,
    profileCompletion: { percent, missing },
    timeline: stageTimelineDto(p.onboardingStages),
    form: {
      phone: p.phone,
      whatsapp: p.whatsapp,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      addressLine: p.addressLine,
      city: p.city,
      state: p.state,
      pincode: p.pincode,
      highestQualification: p.highestQualification,
      degree: p.degree,
      institution: p.institution,
      qualificationYear: p.qualificationYear,
      yearsExperience: p.yearsExperience,
      currentOccupation: p.currentOccupation,
      previousExperience: p.previousExperience,
      employmentType: p.employmentType,
      availabilityHoursPerWeek: p.availabilityHoursPerWeek,
      bio: p.bio,
      teachingStyle: p.teachingStyle,
      qualifications: p.qualifications,
      languages: p.languages,
      boards: p.boards,
      subjectSlugs: p.subjects.map((s) => s.slug),
      gradeSlugs: p.grades.map((g) => g.slug),
      preferredMode: p.preferredMode,
      preferredStudentAgeGroup: p.preferredStudentAgeGroup,
      preferredClassDurationMin: p.preferredClassDurationMin,
      preferredDays: p.preferredDays,
      preferredHours: p.preferredHours,
      expectedRate: p.expectedRate ? Number(p.expectedRate) : null,
      techSetup: p.techSetup ?? null,
    },
    documents: p.documents.map((d) => ({
      id: d.id,
      type: d.type,
      fileName: d.fileName,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      createdAt: d.createdAt,
      verifiedAt: d.verifiedAt,
    })),
    counseling: p.counselingSessions.map((c) => ({
      id: c.id,
      scheduledAt: c.scheduledAt,
      mode: c.mode,
      outcome: c.outcome,
      completedAt: c.completedAt,
    })),
    demos: p.demos.map((d) => ({
      id: d.id,
      scheduledAt: d.scheduledAt,
      subject: d.subject,
      topic: d.topic,
      meetingLink: d.meetingLink,
      result: d.result,
    })),
    techAssessmentDone: !!p.techAssessment?.completedAt,
  };
}

type FormBody = z.infer<typeof teacherOnboardingFormSchema>;

/**
 * Applies a teacher onboarding form save/submit to `mentorProfileId`. Shared
 * by the logged-in and token flows. `actorId` is the applicant's own user id
 * (both flows). Returns the new status, or an { error, status } to relay.
 */
export async function applyOnboardingForm(opts: {
  mentorProfileId: string;
  currentStatus: string;
  formSubmittedAlready: boolean;
  actorName: string;
  actorId: string;
  body: FormBody;
}): Promise<{ ok: true; status: string } | { ok: false; error: string; httpStatus: number }> {
  const { mentorProfileId, currentStatus, formSubmittedAlready, actorId, actorName, body } = opts;

  if (currentStatus === "ACTIVE") {
    return { ok: false, error: "Your application is already approved.", httpStatus: 409 };
  }
  if (currentStatus === "REJECTED") {
    return { ok: false, error: "This application has been closed.", httpStatus: 409 };
  }

  if (body.subjectSlugs.length) {
    const found = await prisma.subject.count({ where: { slug: { in: body.subjectSlugs } } });
    if (found !== body.subjectSlugs.length) {
      return { ok: false, error: "One or more subjects were not recognized", httpStatus: 400 };
    }
  }
  if (body.gradeSlugs.length) {
    const found = await prisma.grade.count({ where: { slug: { in: body.gradeSlugs } } });
    if (found !== body.gradeSlugs.length) {
      return { ok: false, error: "One or more class levels were not recognized", httpStatus: 400 };
    }
  }

  // Hard gate: a full application can't be submitted until every required
  // field and document is present (the client also disables the button).
  if (body.submit) {
    const missingFields = missingRequiredApplicationFields({
      ...body,
      subjectsCount: body.subjectSlugs.length,
      gradesCount: body.gradeSlugs.length,
      daysCount: body.preferredDays.length,
    });
    const docTypes = await prisma.teacherDocument.findMany({
      where: { mentorProfileId, type: { in: REQUIRED_DOC_TYPES as unknown as TeacherDocumentType[] } },
      select: { type: true },
    });
    const have = new Set(docTypes.map((d) => d.type));
    const missingDocs = REQUIRED_DOC_TYPES.filter((t) => !have.has(t as TeacherDocumentType)).map(
      (t) => REQUIRED_DOC_LABELS[t],
    );
    const allMissing = [...missingFields, ...missingDocs];
    if (allMissing.length) {
      return {
        ok: false,
        error: `Please complete: ${allMissing.join(", ")}`,
        httpStatus: 400,
      };
    }
  }

  const updated = await prisma.mentorProfile.update({
    where: { id: mentorProfileId },
    data: {
      phone: body.phone,
      whatsapp: body.whatsapp,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      addressLine: body.addressLine,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      highestQualification: body.highestQualification,
      degree: body.degree,
      institution: body.institution,
      qualificationYear: body.qualificationYear,
      yearsExperience: body.yearsExperience,
      currentOccupation: body.currentOccupation,
      previousExperience: body.previousExperience,
      employmentType: body.employmentType,
      availabilityHoursPerWeek: body.availabilityHoursPerWeek,
      bio: body.bio,
      teachingStyle: body.teachingStyle,
      qualifications: body.qualifications,
      languages: body.languages,
      boards: body.boards,
      preferredMode: body.preferredMode,
      preferredStudentAgeGroup: body.preferredStudentAgeGroup,
      preferredClassDurationMin: body.preferredClassDurationMin,
      preferredDays: body.preferredDays,
      preferredHours: body.preferredHours,
      expectedRate: body.expectedRate != null ? new Prisma.Decimal(body.expectedRate) : null,
      // Equipment is recorded by the admin (TeacherTechAssessment), not the
      // applicant — only touch techSetup if a value is actually supplied.
      ...(body.techSetup !== undefined ? { techSetup: body.techSetup as Prisma.InputJsonValue } : {}),
      ...(body.subjectSlugs.length ? { subjects: { set: body.subjectSlugs.map((slug) => ({ slug })) } } : {}),
      ...(body.gradeSlugs.length ? { grades: { set: body.gradeSlugs.map((slug) => ({ slug })) } } : {}),
      ...(body.submit && !formSubmittedAlready ? { onboardingFormSubmittedAt: new Date() } : {}),
      ...(currentStatus === "NEEDS_CORRECTION" && body.submit ? { status: "UNDER_REVIEW" as const } : {}),
    },
  });

  if (body.submit) {
    await completeStage(mentorProfileId, "FORM", actorId, "Information form submitted by applicant");
    await prisma.teacherLead
      .updateMany({ where: { mentorProfileId }, data: { status: "FORM_SUBMITTED" } })
      .catch(() => {});
    await recordAuditLog({
      actorId,
      action: "TEACHER_ONBOARDING_FORM_SUBMITTED",
      resourceType: "MentorProfile",
      resourceId: mentorProfileId,
    });
    await notifyPermissionHolders("teacher_onboarding.read", {
      type: "TEACHER_FORM_SUBMITTED",
      title: `${actorName} submitted their onboarding form`,
      linkUrl: `/admin/teacher-onboarding/${mentorProfileId}`,
    });
  } else {
    await recordAuditLog({
      actorId,
      action: "TEACHER_ONBOARDING_FORM_SAVED",
      resourceType: "MentorProfile",
      resourceId: mentorProfileId,
    });
  }

  return { ok: true, status: updated.status };
}
