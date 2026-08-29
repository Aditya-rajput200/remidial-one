import { describe, it, expect } from "vitest";
import { computeResultMetrics, computeAssessmentAggregate, type EnrichedAttempt } from "../metrics";

function attempt(overrides: Partial<EnrichedAttempt>): EnrichedAttempt {
  return {
    isCorrect: null,
    attempted: false,
    marksObtained: null,
    maxMarks: 1,
    timeSpentSeconds: 30,
    type: "MCQ",
    chapterId: null,
    topicId: null,
    cognitiveLevel: "UNDERSTAND",
    skills: [],
    ...overrides,
  };
}

describe("computeResultMetrics", () => {
  it("groups by chapter and computes accuracy", () => {
    const attempts = [
      attempt({ chapterId: "ch1", attempted: true, isCorrect: true, marksObtained: 2, maxMarks: 2 }),
      attempt({ chapterId: "ch1", attempted: true, isCorrect: false, marksObtained: 0, maxMarks: 2 }),
      attempt({ chapterId: "ch2", attempted: false, maxMarks: 2 }),
    ];

    const metrics = computeResultMetrics(attempts);
    const ch1 = metrics.chapterMetrics.find((m) => m.chapterId === "ch1")!;
    expect(ch1.metric).toEqual({ attempted: 2, correct: 1, incorrect: 1, marksObtained: 2, maxMarks: 4, accuracyPercent: 50 });

    const ch2 = metrics.chapterMetrics.find((m) => m.chapterId === "ch2")!;
    expect(ch2.metric.attempted).toBe(0);
    expect(ch2.metric.accuracyPercent).toBe(0);
  });

  it("attributes one question to every skill it's tagged with", () => {
    const attempts = [attempt({ skills: ["LOGICAL_REASONING", "APPLICATION"], attempted: true, isCorrect: true, marksObtained: 1, maxMarks: 1 })];
    const metrics = computeResultMetrics(attempts);
    expect(metrics.skillMetrics.map((m) => m.skill).sort()).toEqual(["APPLICATION", "LOGICAL_REASONING"]);
    expect(metrics.skillMetrics.every((m) => m.metric.correct === 1)).toBe(true);
  });

  it("computes average time per question type", () => {
    const attempts = [
      attempt({ type: "MCQ", attempted: true, isCorrect: true, marksObtained: 1, maxMarks: 1, timeSpentSeconds: 20 }),
      attempt({ type: "MCQ", attempted: true, isCorrect: false, marksObtained: 0, maxMarks: 1, timeSpentSeconds: 40 }),
    ];
    const metrics = computeResultMetrics(attempts);
    const mcq = metrics.questionTypeMetrics.find((m) => m.type === "MCQ")!;
    expect(mcq.metric.averageTimeSeconds).toBe(30);
  });
});

describe("computeAssessmentAggregate", () => {
  it("returns nulls when nobody has completed the assessment yet", () => {
    const aggregate = computeAssessmentAggregate([], 3);
    expect(aggregate).toEqual({
      attemptsCount: 3,
      completedCount: 0,
      averageScore: null,
      highestScore: null,
      lowestScore: null,
      medianScore: null,
      averageAccuracy: null,
      averageTimeSeconds: null,
    });
  });

  it("computes median correctly for both even and odd counts", () => {
    const odd = computeAssessmentAggregate(
      [
        { percentage: 50, accuracyPercent: 50, timeSpentSeconds: 100 },
        { percentage: 70, accuracyPercent: 70, timeSpentSeconds: 100 },
        { percentage: 90, accuracyPercent: 90, timeSpentSeconds: 100 },
      ],
      3,
    );
    expect(odd.medianScore).toBe(70);
    expect(odd.highestScore).toBe(90);
    expect(odd.lowestScore).toBe(50);

    const even = computeAssessmentAggregate(
      [
        { percentage: 40, accuracyPercent: 40, timeSpentSeconds: 100 },
        { percentage: 60, accuracyPercent: 60, timeSpentSeconds: 100 },
      ],
      2,
    );
    expect(even.medianScore).toBe(50);
  });
});
