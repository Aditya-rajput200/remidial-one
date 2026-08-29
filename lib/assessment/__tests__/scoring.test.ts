import { describe, it, expect } from "vitest";
import { scoreAnswer, isSubjectiveType } from "../scoring";

describe("scoreAnswer", () => {
  it("scores a correct MCQ answer", () => {
    const content = { options: [{ id: "a", text: "2" }, { id: "b", text: "4" }], correctOptionIds: ["b"] };
    const result = scoreAnswer("MCQ", content, { selectedOptionId: "b" }, 4, 1);
    expect(result).toEqual({ autoScored: true, isCorrect: true, marksObtained: 4 });
  });

  it("applies negative marking for a wrong MCQ answer", () => {
    const content = { options: [{ id: "a", text: "2" }, { id: "b", text: "4" }], correctOptionIds: ["b"] };
    const result = scoreAnswer("MCQ", content, { selectedOptionId: "a" }, 4, 1);
    expect(result).toEqual({ autoScored: true, isCorrect: false, marksObtained: -1 });
  });

  it("requires an exact set match for MULTIPLE_CORRECT", () => {
    const content = {
      options: [{ id: "a", text: "2" }, { id: "b", text: "3" }, { id: "c", text: "4" }],
      correctOptionIds: ["a", "b"],
    };
    expect(scoreAnswer("MULTIPLE_CORRECT", content, { selectedOptionIds: ["a", "b"] }, 2, 0).isCorrect).toBe(true);
    expect(scoreAnswer("MULTIPLE_CORRECT", content, { selectedOptionIds: ["a"] }, 2, 0).isCorrect).toBe(false);
    expect(scoreAnswer("MULTIPLE_CORRECT", content, { selectedOptionIds: ["a", "b", "c"] }, 2, 0).isCorrect).toBe(false);
  });

  it("matches FILL_BLANK case-insensitively by default", () => {
    const content = { acceptedAnswers: ["Delhi"], caseSensitive: false };
    expect(scoreAnswer("FILL_BLANK", content, { text: "delhi" }, 2, 0).isCorrect).toBe(true);
    expect(scoreAnswer("FILL_BLANK", content, { text: "Mumbai" }, 2, 0).isCorrect).toBe(false);
  });

  it("respects case sensitivity for FILL_BLANK when enabled", () => {
    const content = { acceptedAnswers: ["Delhi"], caseSensitive: true };
    expect(scoreAnswer("FILL_BLANK", content, { text: "delhi" }, 2, 0).isCorrect).toBe(false);
  });

  it("gives proportional partial credit for MATCH_FOLLOWING", () => {
    const content = {
      left: [{ id: "l1", text: "Apple" }, { id: "l2", text: "Dog" }],
      right: [{ id: "r1", text: "Fruit" }, { id: "r2", text: "Animal" }],
      correctPairs: [{ leftId: "l1", rightId: "r1" }, { leftId: "l2", rightId: "r2" }],
    };
    const half = scoreAnswer("MATCH_FOLLOWING", content, { pairs: [{ leftId: "l1", rightId: "r1" }] }, 4, 0);
    expect(half.isCorrect).toBe(false);
    expect(half.marksObtained).toBe(2);

    const full = scoreAnswer(
      "MATCH_FOLLOWING",
      content,
      { pairs: [{ leftId: "l1", rightId: "r1" }, { leftId: "l2", rightId: "r2" }] },
      4,
      0,
    );
    expect(full.isCorrect).toBe(true);
    expect(full.marksObtained).toBe(4);
  });

  it("applies numeric tolerance for NUMERICAL", () => {
    const content = { correctValue: 10, tolerance: 0.5 };
    expect(scoreAnswer("NUMERICAL", content, { value: 10.4 }, 3, 0).isCorrect).toBe(true);
    expect(scoreAnswer("NUMERICAL", content, { value: 11 }, 3, 0).isCorrect).toBe(false);
  });

  it("compares EQUATION numerically when both sides parse as numbers", () => {
    const content = { correctExpression: "3/4", tolerance: 0.01 };
    expect(scoreAnswer("EQUATION", content, { text: "0.75" }, 2, 0).isCorrect).toBe(true);
  });

  it("falls back to normalized string match for EQUATION when not numeric", () => {
    const content = { correctExpression: "x=5", tolerance: 0 };
    expect(scoreAnswer("EQUATION", content, { text: "x = 5" }, 2, 0).isCorrect).toBe(true);
    expect(scoreAnswer("EQUATION", content, { text: "x=6" }, 2, 0).isCorrect).toBe(false);
  });

  it("never auto-scores subjective question types", () => {
    for (const type of ["SHORT_ANSWER", "LONG_ANSWER", "IMAGE_ANSWER"] as const) {
      expect(isSubjectiveType(type)).toBe(true);
      const result = scoreAnswer(type, {}, { text: "anything" }, 5, 0);
      expect(result).toEqual({ autoScored: false, isCorrect: null, marksObtained: null });
    }
  });
});
