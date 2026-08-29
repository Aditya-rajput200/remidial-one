import { z } from "zod";

const QUESTION_TYPES = [
  "MCQ",
  "MULTIPLE_CORRECT",
  "TRUE_FALSE",
  "FILL_BLANK",
  "MATCH_FOLLOWING",
  "SHORT_ANSWER",
  "LONG_ANSWER",
  "IMAGE_ANSWER",
  "NUMERICAL",
  "EQUATION",
] as const;

export const generateQuestionsSchema = z.object({
  subjectId: z.string().min(1).optional(),
  chapterId: z.string().min(1).optional(),
  topicId: z.string().min(1).optional(),
  topicHint: z.string().trim().max(300).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "VERY_HARD"]).default("MEDIUM"),
  cognitiveLevel: z.enum(["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"]).default("UNDERSTAND"),
  skills: z.array(z.string()).default([]),
  typeCounts: z
    .record(z.enum(QUESTION_TYPES), z.number().int().min(0).max(20))
    .refine((counts) => Object.values(counts).some((c) => c > 0), { message: "Request at least one question" })
    .refine((counts) => Object.values(counts).reduce((a, b) => a + b, 0) <= 30, {
      message: "Generate at most 30 questions at a time",
    }),
});
