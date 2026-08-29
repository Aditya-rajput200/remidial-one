import { z } from "zod";

/**
 * Per-QuestionType schemas for the two JSON payloads that vary by type:
 * `Question.content` (the question definition — options/correct answers/
 * tolerance/pairs) and a `StudentAnswer.response` (what a student actually
 * submitted). Both manual question creation and AI-generated drafts are
 * validated through the exact same `questionContentSchemas` map — this is
 * the spec's §38 "never trust AI output blindly" safety gate.
 *
 * Answer keys (correctOptionIds, correctAnswer, acceptedAnswers,
 * correctPairs, correctValue, correctExpression) live only in `content` and
 * must never reach a student-facing DTO — see lib/assessment/dto.ts.
 */

const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
});

const mcqContentSchema = z.object({
  options: z.array(optionSchema).min(2).max(10),
  correctOptionIds: z.array(z.string().min(1)).length(1),
});

const multipleCorrectContentSchema = z.object({
  options: z.array(optionSchema).min(2).max(10),
  correctOptionIds: z.array(z.string().min(1)).min(1),
});

const trueFalseContentSchema = z.object({
  correctAnswer: z.boolean(),
});

const fillBlankContentSchema = z.object({
  acceptedAnswers: z.array(z.string().trim().min(1).max(500)).min(1),
  caseSensitive: z.boolean().default(false),
});

const matchPairSchema = z.object({ leftId: z.string().min(1), rightId: z.string().min(1) });

const matchFollowingContentSchema = z.object({
  left: z.array(optionSchema).min(2).max(10),
  right: z.array(optionSchema).min(2).max(10),
  correctPairs: z.array(matchPairSchema).min(2),
});

const shortAnswerContentSchema = z.object({
  expectedAnswer: z.string().trim().max(2000).optional(),
  rubric: z.string().trim().max(2000).optional(),
  maxWords: z.number().int().min(1).max(200).optional(),
});

const longAnswerContentSchema = z.object({
  expectedAnswer: z.string().trim().max(5000).optional(),
  rubric: z.string().trim().max(2000).optional(),
  maxWords: z.number().int().min(1).max(2000).optional(),
});

const imageAnswerContentSchema = z.object({
  instructions: z.string().trim().max(1000).optional(),
  rubric: z.string().trim().max(2000).optional(),
});

const numericalContentSchema = z.object({
  correctValue: z.number(),
  tolerance: z.number().min(0).default(0),
  unit: z.string().trim().max(50).optional(),
});

const equationContentSchema = z.object({
  correctExpression: z.string().trim().min(1).max(500),
  tolerance: z.number().min(0).default(0),
});

export const questionContentSchemas = {
  MCQ: mcqContentSchema,
  MULTIPLE_CORRECT: multipleCorrectContentSchema,
  TRUE_FALSE: trueFalseContentSchema,
  FILL_BLANK: fillBlankContentSchema,
  MATCH_FOLLOWING: matchFollowingContentSchema,
  SHORT_ANSWER: shortAnswerContentSchema,
  LONG_ANSWER: longAnswerContentSchema,
  IMAGE_ANSWER: imageAnswerContentSchema,
  NUMERICAL: numericalContentSchema,
  EQUATION: equationContentSchema,
} as const;

export type QuestionTypeKey = keyof typeof questionContentSchemas;

export function parseQuestionContent(type: QuestionTypeKey, content: unknown) {
  return questionContentSchemas[type].parse(content);
}

// --- Student response payloads ---------------------------------------------

const mcqResponseSchema = z.object({ selectedOptionId: z.string().min(1) });
const multipleCorrectResponseSchema = z.object({ selectedOptionIds: z.array(z.string().min(1)) });
const trueFalseResponseSchema = z.object({ value: z.boolean() });
const fillBlankResponseSchema = z.object({ text: z.string().trim().max(500) });
const matchFollowingResponseSchema = z.object({ pairs: z.array(matchPairSchema) });
const textResponseSchema = z.object({ text: z.string().trim().max(20000) });
const imageAnswerResponseSchema = z.object({ note: z.string().trim().max(1000).optional() });
const numericalResponseSchema = z.object({ value: z.number() });
const equationResponseSchema = z.object({ text: z.string().trim().max(1000) });

export const answerResponseSchemas = {
  MCQ: mcqResponseSchema,
  MULTIPLE_CORRECT: multipleCorrectResponseSchema,
  TRUE_FALSE: trueFalseResponseSchema,
  FILL_BLANK: fillBlankResponseSchema,
  MATCH_FOLLOWING: matchFollowingResponseSchema,
  SHORT_ANSWER: textResponseSchema,
  LONG_ANSWER: textResponseSchema,
  IMAGE_ANSWER: imageAnswerResponseSchema,
  NUMERICAL: numericalResponseSchema,
  EQUATION: equationResponseSchema,
} as const;

export function parseAnswerResponse(type: QuestionTypeKey, response: unknown) {
  return answerResponseSchemas[type].parse(response);
}

// --- Question CRUD -----------------------------------------------------------

const QUESTION_TYPES = Object.keys(questionContentSchemas) as [QuestionTypeKey, ...QuestionTypeKey[]];
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "VERY_HARD"] as const;
const COGNITIVE_LEVELS = ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"] as const;
const QUESTION_SKILLS = [
  "MEMORY",
  "RECALL",
  "CONCEPTUAL_UNDERSTANDING",
  "READING",
  "WRITING",
  "MENTAL_ABILITY",
  "LOGICAL_REASONING",
  "CRITICAL_THINKING",
  "PROBLEM_SOLVING",
  "ANALYTICAL_THINKING",
  "APPLICATION",
  "CALCULATION",
  "INTERPRETATION",
  "CREATIVITY",
  "COMMUNICATION",
] as const;
const QUESTION_PURPOSES = ["DIAGNOSTIC", "PRACTICE", "REVISION", "ASSESSMENT", "COMPETITIVE", "REMEDIAL", "MASTERY"] as const;

// Plain (refinement-free) base shape shared by create/update — kept separate
// from the `.superRefine()`-attached schemas below so `.partial()` never
// carries create's "type is required" refinement onto the update schema
// (Zod v4 attaches checks to the object itself rather than wrapping it, so
// deriving update from create's refined schema would re-run create's check
// with a possibly-undefined `type`).
const questionFieldsSchema = z.object({
  type: z.enum(QUESTION_TYPES),
  subjectId: z.string().min(1).optional(),
  chapterId: z.string().min(1).optional(),
  topicId: z.string().min(1).optional(),
  subtopic: z.string().trim().max(200).optional(),
  difficulty: z.enum(DIFFICULTIES).default("MEDIUM"),
  cognitiveLevel: z.enum(COGNITIVE_LEVELS).default("UNDERSTAND"),
  skills: z.array(z.enum(QUESTION_SKILLS)).default([]),
  purpose: z.enum(QUESTION_PURPOSES).default("ASSESSMENT"),
  text: z.string().trim().min(1).max(5000),
  explanation: z.string().trim().max(5000).optional(),
  hint: z.string().trim().max(1000).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).default([]),
  defaultMarks: z.number().min(0).max(1000).default(1),
  defaultNegativeMarks: z.number().min(0).max(1000).default(0),
  estimatedTimeSeconds: z.number().int().min(5).max(3600).default(60),
  content: z.unknown(),
  media: z.unknown().optional(),
});

export const createQuestionSchema = questionFieldsSchema.superRefine((data, ctx) => {
  const result = questionContentSchemas[data.type].safeParse(data.content);
  if (!result.success) {
    for (const issue of result.error.issues) {
      ctx.addIssue({ ...issue, path: ["content", ...issue.path] });
    }
  }
});

export const updateQuestionSchema = questionFieldsSchema
  .partial()
  .extend({
    isArchived: z.boolean().optional(),
    status: z.enum(["DRAFT", "APPROVED", "ARCHIVED"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.type || data.content === undefined) return;
    const result = questionContentSchemas[data.type].safeParse(data.content);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ ...issue, path: ["content", ...issue.path] });
      }
    }
  });

export const questionSearchSchema = z.object({
  q: z.string().trim().max(200).optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  type: z.enum(QUESTION_TYPES).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  skill: z.enum(QUESTION_SKILLS).optional(),
  cognitiveLevel: z.enum(COGNITIVE_LEVELS).optional(),
  status: z.enum(["DRAFT", "APPROVED", "ARCHIVED"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createChapterSchema = z.object({ name: z.string().trim().min(1).max(200) });
export const createTopicSchema = z.object({ name: z.string().trim().min(1).max(200) });
