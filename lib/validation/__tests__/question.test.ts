import { describe, it, expect } from "vitest";
import { createQuestionSchema, updateQuestionSchema } from "../question";

const baseMcq = {
  type: "MCQ" as const,
  text: "What is 2 + 2?",
  content: {
    options: [
      { id: "a", text: "3" },
      { id: "b", text: "4" },
    ],
    correctOptionIds: ["b"],
  },
};

describe("createQuestionSchema", () => {
  it("accepts a valid MCQ question", () => {
    expect(() => createQuestionSchema.parse(baseMcq)).not.toThrow();
  });

  it("rejects content that doesn't match the declared type — the AI-safety gate", () => {
    const malformed = { ...baseMcq, content: { correctAnswer: true } };
    expect(() => createQuestionSchema.parse(malformed)).toThrow();
  });

  it("rejects an MCQ with more than one correct option", () => {
    const malformed = {
      ...baseMcq,
      content: { ...baseMcq.content, correctOptionIds: ["a", "b"] },
    };
    expect(() => createQuestionSchema.parse(malformed)).toThrow();
  });

  it("rejects a missing/empty answer key", () => {
    const malformed = { ...baseMcq, content: { ...baseMcq.content, correctOptionIds: [] } };
    expect(() => createQuestionSchema.parse(malformed)).toThrow();
  });
});

describe("updateQuestionSchema", () => {
  it("allows a partial update with no type/content change", () => {
    expect(() => updateQuestionSchema.parse({ hint: "Think carefully" })).not.toThrow();
  });

  it("does not require `type` to be present (unlike createQuestionSchema)", () => {
    expect(() => updateQuestionSchema.parse({ text: "Updated text" })).not.toThrow();
  });

  it("still validates content against type when both are supplied together", () => {
    expect(() => updateQuestionSchema.parse({ type: "TRUE_FALSE", content: { correctAnswer: true } })).not.toThrow();
    expect(() => updateQuestionSchema.parse({ type: "TRUE_FALSE", content: { correctOptionIds: ["a"] } })).toThrow();
  });
});
