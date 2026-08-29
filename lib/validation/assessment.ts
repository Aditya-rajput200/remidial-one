import { z } from "zod";

const RESULT_VISIBILITY = ["SCORE_ONLY", "SCORE_AND_ANSWERS", "FULL_DETAIL"] as const;
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "VERY_HARD"] as const;

export const createAssessmentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  subjectId: z.string().min(1).optional(),
  gradeLabel: z.string().trim().max(100).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  instructions: z.string().trim().max(5000).optional(),
  durationMinutes: z.number().int().min(1).max(600),
  passingMarks: z.number().min(0).optional(),
  attemptLimit: z.number().int().min(1).max(10).default(1),
  negativeMarkingEnabled: z.boolean().default(false),
  calculatorAllowed: z.boolean().default(false),
  freeNavigation: z.boolean().default(true),
  autoSubmitOnExpiry: z.boolean().default(true),
  randomizeQuestions: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),
  resultVisibility: z.enum(RESULT_VISIBILITY).default("SCORE_ONLY"),
  showCorrectAnswers: z.boolean().default(false),
  showSolutions: z.boolean().default(false),
  showRank: z.boolean().default(false),
  showClassAverage: z.boolean().default(false),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
});

export const updateAssessmentSchema = createAssessmentSchema.partial();

export const scheduleAssessmentSchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
  })
  .refine((data) => data.endAt.getTime() > data.startAt.getTime(), {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });

export const assignStudentsSchema = z.object({
  studentIds: z.array(z.string().min(1)).min(1).max(500),
});

export const createModuleSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  instructions: z.string().trim().max(5000).optional(),
  timeLimitMinutes: z.number().int().min(1).max(600).optional(),
});

export const updateModuleSchema = createModuleSchema.partial();

export const reorderModulesSchema = z.object({
  moduleIds: z.array(z.string().min(1)).min(1),
});

export const addModuleQuestionSchema = z.object({
  questionId: z.string().min(1),
  marks: z.number().min(0).max(1000),
  negativeMarks: z.number().min(0).max(1000).default(0),
});

export const updateModuleQuestionSchema = z.object({
  marks: z.number().min(0).max(1000).optional(),
  negativeMarks: z.number().min(0).max(1000).optional(),
});

export const reorderModuleQuestionsSchema = z.object({
  moduleQuestionIds: z.array(z.string().min(1)).min(1),
});
