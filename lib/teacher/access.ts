import "server-only";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { computeProfileCompletion, stageTimelineDto } from "@/lib/teacher/onboarding";

// Full include for the admin onboarding / verification screen.
export const onboardingDetailInclude = {
  user: { select: { id: true, name: true, email: true, avatarUrl: true, status: true, createdAt: true } },
  subjects: { select: { slug: true, name: true } },
  grades: { select: { slug: true, name: true } },
  onboardingStages: true,
  documents: {
    orderBy: { createdAt: "desc" },
    include: { verifiedBy: { select: { name: true } }, uploadedBy: { select: { name: true } } },
  },
  counselingSessions: {
    orderBy: { createdAt: "desc" },
    include: { counselor: { select: { name: true } } },
  },
  demos: { orderBy: { createdAt: "desc" }, include: { evaluator: { select: { name: true } } } },
  techAssessment: { include: { assessedBy: { select: { name: true } } } },
  verificationEvents: { orderBy: { createdAt: "desc" }, include: { actor: { select: { name: true } } } },
  lead: { include: { assignedTo: { select: { name: true } } } },
} satisfies Prisma.MentorProfileInclude;

export type OnboardingDetail = Prisma.MentorProfileGetPayload<{ include: typeof onboardingDetailInclude }>;

/** Never leaks blobPathname — downloads go through the proxied route. */
function documentDto(mentorProfileId: string, d: OnboardingDetail["documents"][number]) {
  return {
    id: d.id,
    type: d.type,
    fileName: d.fileName,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    createdAt: d.createdAt,
    verifiedAt: d.verifiedAt,
    verifiedByName: d.verifiedBy?.name ?? null,
    uploadedByName: d.uploadedBy.name,
    downloadUrl: `/api/teacher-onboarding/${mentorProfileId}/documents/${d.id}/download`,
  };
}

export function onboardingDetailDto(profile: OnboardingDetail) {
  const { percent, missing } = computeProfileCompletion(profile);
  return {
    id: profile.id,
    status: profile.status,
    user: profile.user,
    createdAt: profile.createdAt,
    onboardingFormSubmittedAt: profile.onboardingFormSubmittedAt,
    onboardedAt: profile.onboardedAt,
    reviewedAt: profile.reviewedAt,
    rejectionReason: profile.rejectionReason,
    profileCompletion: { percent, missing },
    personal: {
      phone: profile.phone,
      whatsapp: profile.whatsapp,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      addressLine: profile.addressLine,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
    },
    professional: {
      highestQualification: profile.highestQualification,
      degree: profile.degree,
      institution: profile.institution,
      qualificationYear: profile.qualificationYear,
      yearsExperience: profile.yearsExperience,
      currentOccupation: profile.currentOccupation,
      previousExperience: profile.previousExperience,
      employmentType: profile.employmentType,
      availabilityHoursPerWeek: profile.availabilityHoursPerWeek,
      bio: profile.bio,
      teachingStyle: profile.teachingStyle,
      qualifications: profile.qualifications,
      languages: profile.languages,
      boards: profile.boards,
      subjects: profile.subjects,
      grades: profile.grades,
    },
    preferences: {
      preferredMode: profile.preferredMode,
      preferredStudentAgeGroup: profile.preferredStudentAgeGroup,
      preferredClassDurationMin: profile.preferredClassDurationMin,
      preferredDays: profile.preferredDays,
      preferredHours: profile.preferredHours,
      expectedRate: profile.expectedRate ? Number(profile.expectedRate) : null,
    },
    techSetup: profile.techSetup ?? null,
    timeline: stageTimelineDto(profile.onboardingStages),
    documents: profile.documents.map((d) => documentDto(profile.id, d)),
    counselingSessions: profile.counselingSessions.map((c) => ({
      id: c.id,
      scheduledAt: c.scheduledAt,
      mode: c.mode,
      counselorName: c.counselor?.name ?? null,
      notes: c.notes,
      teacherExpectations: c.teacherExpectations,
      subjectDiscussion: c.subjectDiscussion,
      experienceVerified: c.experienceVerified,
      communicationNotes: c.communicationNotes,
      availabilityNotes: c.availabilityNotes,
      compensationNotes: c.compensationNotes,
      recommendation: c.recommendation,
      outcome: c.outcome,
      completedAt: c.completedAt,
      createdAt: c.createdAt,
    })),
    demos: profile.demos.map((d) => ({
      id: d.id,
      scheduledAt: d.scheduledAt,
      subject: d.subject,
      gradeLabel: d.gradeLabel,
      topic: d.topic,
      durationMinutes: d.durationMinutes,
      meetingLink: d.meetingLink,
      evaluatorName: d.evaluator?.name ?? null,
      notes: d.notes,
      result: d.result,
      ratings: d.ratings ?? null,
      evaluatorComments: d.evaluatorComments,
      evaluatedAt: d.evaluatedAt,
      createdAt: d.createdAt,
    })),
    techAssessment: profile.techAssessment
      ? {
          items: profile.techAssessment.items,
          adminNotes: profile.techAssessment.adminNotes,
          assessedByName: profile.techAssessment.assessedBy?.name ?? null,
          completedAt: profile.techAssessment.completedAt,
          updatedAt: profile.techAssessment.updatedAt,
        }
      : null,
    verificationEvents: profile.verificationEvents.map((e) => ({
      id: e.id,
      action: e.action,
      reason: e.reason,
      actorName: e.actor.name,
      createdAt: e.createdAt,
    })),
    lead: profile.lead
      ? {
          id: profile.lead.id,
          source: profile.lead.source,
          status: profile.lead.status,
          assignedToName: profile.lead.assignedTo?.name ?? null,
          createdAt: profile.lead.createdAt,
        }
      : null,
  };
}

/** Combined AuditLog timeline for an applicant (lead + profile scoped rows). */
export async function loadOnboardingTimeline(mentorProfileId: string, leadId?: string) {
  const rows = await prisma.auditLog.findMany({
    where: {
      OR: [
        { resourceType: "MentorProfile", resourceId: mentorProfileId },
        { resourceType: "TeacherOnboarding", resourceId: mentorProfileId },
        ...(leadId ? [{ resourceType: "TeacherLead", resourceId: leadId }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    actorName: r.actor?.name ?? "System",
    metadata: r.metadata,
    createdAt: r.createdAt,
  }));
}
