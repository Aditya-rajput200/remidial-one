/**
 * Pure aggregation — mirrors lib/stats/studentStats.ts's separation from
 * Prisma. Callers (submit route, evaluation-finalize route) fetch the
 * enriched attempt rows, call this, then persist the result as the
 * precomputed Chapter/Topic/Skill/Cognitive/QuestionType metric rows a
 * result/analytics page reads directly. Recomputed from scratch each call
 * (not incremental) — attempt counts per assessment are small enough
 * (tens of questions) that correctness matters more than avoiding a re-scan.
 */

export type EnrichedAttempt = {
  isCorrect: boolean | null;
  attempted: boolean;
  marksObtained: number | null;
  maxMarks: number;
  timeSpentSeconds: number;
  type: string;
  chapterId: string | null;
  topicId: string | null;
  cognitiveLevel: string;
  skills: string[];
};

type Bucket = { attempted: number; correct: number; incorrect: number; marksObtained: number; maxMarks: number; timeSeconds: number };

function emptyBucket(): Bucket {
  return { attempted: 0, correct: 0, incorrect: 0, marksObtained: 0, maxMarks: 0, timeSeconds: 0 };
}

function addToBucket(bucket: Bucket, attempt: EnrichedAttempt) {
  bucket.maxMarks += attempt.maxMarks;
  bucket.timeSeconds += attempt.timeSpentSeconds;
  if (attempt.attempted) {
    bucket.attempted += 1;
    bucket.marksObtained += attempt.marksObtained ?? 0;
    if (attempt.isCorrect === true) bucket.correct += 1;
    if (attempt.isCorrect === false) bucket.incorrect += 1;
  }
}

function bucketToMetric(bucket: Bucket) {
  return {
    attempted: bucket.attempted,
    correct: bucket.correct,
    incorrect: bucket.incorrect,
    marksObtained: Math.round(bucket.marksObtained * 100) / 100,
    maxMarks: Math.round(bucket.maxMarks * 100) / 100,
    accuracyPercent: bucket.attempted > 0 ? Math.round((bucket.correct / bucket.attempted) * 10000) / 100 : 0,
  };
}

export type ResultMetrics = {
  chapterMetrics: { chapterId: string; metric: ReturnType<typeof bucketToMetric> }[];
  topicMetrics: { topicId: string; metric: ReturnType<typeof bucketToMetric> }[];
  skillMetrics: { skill: string; metric: ReturnType<typeof bucketToMetric> }[];
  cognitiveMetrics: { level: string; metric: ReturnType<typeof bucketToMetric> }[];
  questionTypeMetrics: { type: string; metric: ReturnType<typeof bucketToMetric> & { averageTimeSeconds: number } }[];
};

export function computeResultMetrics(attempts: EnrichedAttempt[]): ResultMetrics {
  const byChapter = new Map<string, Bucket>();
  const byTopic = new Map<string, Bucket>();
  const bySkill = new Map<string, Bucket>();
  const byCognitive = new Map<string, Bucket>();
  const byType = new Map<string, Bucket>();

  for (const attempt of attempts) {
    if (attempt.chapterId) addToBucket(getOrCreate(byChapter, attempt.chapterId), attempt);
    if (attempt.topicId) addToBucket(getOrCreate(byTopic, attempt.topicId), attempt);
    for (const skill of attempt.skills) addToBucket(getOrCreate(bySkill, skill), attempt);
    addToBucket(getOrCreate(byCognitive, attempt.cognitiveLevel), attempt);
    addToBucket(getOrCreate(byType, attempt.type), attempt);
  }

  return {
    chapterMetrics: [...byChapter.entries()].map(([chapterId, b]) => ({ chapterId, metric: bucketToMetric(b) })),
    topicMetrics: [...byTopic.entries()].map(([topicId, b]) => ({ topicId, metric: bucketToMetric(b) })),
    skillMetrics: [...bySkill.entries()].map(([skill, b]) => ({ skill, metric: bucketToMetric(b) })),
    cognitiveMetrics: [...byCognitive.entries()].map(([level, b]) => ({ level, metric: bucketToMetric(b) })),
    questionTypeMetrics: [...byType.entries()].map(([type, b]) => ({
      type,
      metric: { ...bucketToMetric(b), averageTimeSeconds: b.attempted > 0 ? Math.round(b.timeSeconds / b.attempted) : 0 },
    })),
  };
}

function getOrCreate(map: Map<string, Bucket>, key: string): Bucket {
  let bucket = map.get(key);
  if (!bucket) {
    bucket = emptyBucket();
    map.set(key, bucket);
  }
  return bucket;
}

export type AssessmentAggregate = {
  attemptsCount: number;
  completedCount: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  medianScore: number | null;
  averageAccuracy: number | null;
  averageTimeSeconds: number | null;
};

/** Class-level aggregate across all of an assessment's completed attempts (percent scores). */
export function computeAssessmentAggregate(
  completed: { percentage: number; accuracyPercent: number; timeSpentSeconds: number | null }[],
  attemptsCount: number,
): AssessmentAggregate {
  if (completed.length === 0) {
    return {
      attemptsCount,
      completedCount: 0,
      averageScore: null,
      highestScore: null,
      lowestScore: null,
      medianScore: null,
      averageAccuracy: null,
      averageTimeSeconds: null,
    };
  }

  const scores = completed.map((c) => c.percentage).sort((a, b) => a - b);
  const mid = Math.floor(scores.length / 2);
  const median = scores.length % 2 === 0 ? (scores[mid - 1] + scores[mid]) / 2 : scores[mid];
  const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

  return {
    attemptsCount,
    completedCount: completed.length,
    averageScore: round2(avg(scores)),
    highestScore: round2(scores[scores.length - 1]),
    lowestScore: round2(scores[0]),
    medianScore: round2(median),
    averageAccuracy: round2(avg(completed.map((c) => c.accuracyPercent))),
    averageTimeSeconds: Math.round(avg(completed.map((c) => c.timeSpentSeconds ?? 0))),
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
