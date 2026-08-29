import "server-only";
import { prisma } from "@/lib/db/prisma";

type MasteryEntry = { average: number; count: number };
type MasteryMap = Record<string, MasteryEntry>;

function updateMastery(existing: MasteryMap | null | undefined, key: string, newAccuracy: number): MasteryMap {
  const map: MasteryMap = existing ? { ...existing } : {};
  const prior = map[key];
  map[key] = prior
    ? { average: round2((prior.average * prior.count + newAccuracy) / (prior.count + 1)), count: prior.count + 1 }
    : { average: round2(newAccuracy), count: 1 };
  return map;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const WEAK_THRESHOLD = 50;
const IMPROVING_MARGIN = 10;

/**
 * Called once per result publish. Cumulative-average update (not a full
 * history replay) — O(1) per publish rather than re-scanning every past
 * assessment, at the cost of not being able to reconstruct the exact
 * historical curve later (StudentAssessment/AssessmentResult rows still
 * hold that raw history if it's ever needed).
 */
export async function updateLearningProfile(
  studentId: string,
  input: {
    overallPercentage: number;
    subjectId: string | null;
    chapterAccuracies: { chapterId: string; accuracyPercent: number }[];
    skillAccuracies: { skill: string; accuracyPercent: number }[];
    cognitiveAccuracies: { level: string; accuracyPercent: number }[];
  },
) {
  const existing = await prisma.studentLearningProfile.findUnique({ where: { studentId } });

  const overallMasteryPercent = existing?.overallMasteryPercent
    ? round2((Number(existing.overallMasteryPercent) * existing.assessmentsCompleted + input.overallPercentage) / (existing.assessmentsCompleted + 1))
    : round2(input.overallPercentage);

  let subjectMastery = (existing?.subjectMastery as MasteryMap | null) ?? {};
  if (input.subjectId) subjectMastery = updateMastery(subjectMastery, input.subjectId, input.overallPercentage);

  let chapterMastery = (existing?.chapterMastery as MasteryMap | null) ?? {};
  for (const c of input.chapterAccuracies) chapterMastery = updateMastery(chapterMastery, c.chapterId, c.accuracyPercent);

  let skillMastery = (existing?.skillMastery as MasteryMap | null) ?? {};
  for (const s of input.skillAccuracies) skillMastery = updateMastery(skillMastery, s.skill, s.accuracyPercent);

  let cognitiveProfile = (existing?.cognitiveProfile as MasteryMap | null) ?? {};
  for (const c of input.cognitiveAccuracies) cognitiveProfile = updateMastery(cognitiveProfile, c.level, c.accuracyPercent);

  const persistentWeakAreas = [
    ...Object.entries(chapterMastery).filter(([, v]) => v.count >= 2 && v.average < WEAK_THRESHOLD).map(([k]) => k),
    ...Object.entries(skillMastery).filter(([, v]) => v.count >= 2 && v.average < WEAK_THRESHOLD).map(([k]) => k),
  ];

  const improvingAreas = [
    ...input.chapterAccuracies
      .filter((c) => c.accuracyPercent >= (chapterMastery[c.chapterId]?.average ?? 0) + IMPROVING_MARGIN)
      .map((c) => c.chapterId),
    ...input.skillAccuracies
      .filter((s) => s.accuracyPercent >= (skillMastery[s.skill]?.average ?? 0) + IMPROVING_MARGIN)
      .map((s) => s.skill),
  ];

  await prisma.studentLearningProfile.upsert({
    where: { studentId },
    update: {
      overallMasteryPercent,
      subjectMastery,
      chapterMastery,
      skillMastery,
      cognitiveProfile,
      persistentWeakAreas,
      improvingAreas,
      assessmentsCompleted: { increment: 1 },
      lastAssessmentAt: new Date(),
    },
    create: {
      studentId,
      overallMasteryPercent,
      subjectMastery,
      chapterMastery,
      skillMastery,
      cognitiveProfile,
      persistentWeakAreas,
      improvingAreas,
      assessmentsCompleted: 1,
      lastAssessmentAt: new Date(),
    },
  });
}
