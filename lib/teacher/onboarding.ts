import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ONBOARDING_STAGE_ORDER } from "@/lib/teacher/constants";
import type { OnboardingStageState, TeacherOnboardingStageKey } from "@/lib/generated/prisma/enums";

// Re-export the client-safe constants/helpers so existing server imports of
// `@/lib/teacher/onboarding` keep working. Client components must import from
// `@/lib/teacher/constants` directly (this file pulls in "server-only").
export * from "@/lib/teacher/constants";

/**
 * Seeds the full stage timeline for a freshly converted applicant. CONTACT is
 * already done (they contacted us), FORM is where they land next.
 */
export async function seedOnboardingStages(mentorProfileId: string): Promise<void> {
  await prisma.teacherOnboardingStage.createMany({
    data: ONBOARDING_STAGE_ORDER.map((key) => ({
      mentorProfileId,
      key: key as TeacherOnboardingStageKey,
      state: (key === "CONTACT" ? "COMPLETED" : key === "FORM" ? "CURRENT" : "PENDING") as OnboardingStageState,
      enteredAt: key === "CONTACT" || key === "FORM" ? new Date() : null,
      completedAt: key === "CONTACT" ? new Date() : null,
    })),
    skipDuplicates: true,
  });
}

/**
 * Marks `key` COMPLETED and moves the next PENDING stage to CURRENT. No-op if
 * the stage is already COMPLETED. `responsibleId` is stamped on the completed
 * stage. Safe to call repeatedly.
 */
export async function completeStage(
  mentorProfileId: string,
  key: TeacherOnboardingStageKey,
  responsibleId?: string,
  notes?: string,
): Promise<void> {
  const stages = await prisma.teacherOnboardingStage.findMany({ where: { mentorProfileId } });
  const byKey = new Map(stages.map((s) => [s.key, s]));
  const current = byKey.get(key);
  if (!current || current.state === "COMPLETED") return;

  await prisma.teacherOnboardingStage.update({
    where: { mentorProfileId_key: { mentorProfileId, key } },
    data: {
      state: "COMPLETED",
      completedAt: new Date(),
      ...(responsibleId ? { responsibleId } : {}),
      ...(notes ? { notes } : {}),
    },
  });

  const idx = ONBOARDING_STAGE_ORDER.indexOf(key);
  for (let i = idx + 1; i < ONBOARDING_STAGE_ORDER.length; i += 1) {
    const nextKey = ONBOARDING_STAGE_ORDER[i] as TeacherOnboardingStageKey;
    const next = byKey.get(nextKey);
    if (!next) continue;
    if (next.state === "PENDING") {
      await prisma.teacherOnboardingStage.update({
        where: { mentorProfileId_key: { mentorProfileId, key: nextKey } },
        data: { state: "CURRENT", enteredAt: new Date() },
      });
      break;
    }
    if (next.state === "CURRENT" || next.state === "COMPLETED") break;
  }
}

/** Marks a stage FAILED (e.g. rejected at verification). */
export async function failStage(
  mentorProfileId: string,
  key: TeacherOnboardingStageKey,
  responsibleId?: string,
  notes?: string,
): Promise<void> {
  await prisma.teacherOnboardingStage
    .update({
      where: { mentorProfileId_key: { mentorProfileId, key } },
      data: {
        state: "FAILED",
        ...(responsibleId ? { responsibleId } : {}),
        ...(notes ? { notes } : {}),
      },
    })
    .catch(() => {});
}
