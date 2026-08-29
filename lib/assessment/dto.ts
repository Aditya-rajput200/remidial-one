/**
 * Central place that decides what a student is allowed to see vs. a
 * teacher/admin. No API route should hand-strip answer-key fields itself —
 * route this through here so a forgotten field can't leak an answer key.
 */

type QuestionRecord = {
  id: string;
  type: string;
  difficulty: string;
  cognitiveLevel: string;
  skills: string[];
  purpose: string;
  status: string;
  source: string;
  text: string;
  explanation: string | null;
  hint: string | null;
  tags: string[];
  defaultMarks: unknown;
  defaultNegativeMarks: unknown;
  estimatedTimeSeconds: number;
  content: unknown;
  media: unknown;
  subjectId: string | null;
  chapterId: string | null;
  topicId: string | null;
  subtopic: string | null;
  createdById: string;
  usageCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Full record — teacher/admin only. Never send this to a student. */
export function toTeacherQuestionDto(question: QuestionRecord) {
  return { ...question };
}

// Keys inside `content` that constitute the answer key, per question type —
// stripped before a question ever reaches a student who hasn't finished
// (or isn't allowed to see) the answer.
const ANSWER_KEY_FIELDS = new Set([
  "correctOptionIds",
  "correctAnswer",
  "acceptedAnswers",
  "correctPairs",
  "correctValue",
  "correctExpression",
  "expectedAnswer",
  "rubric",
]);

function stripAnswerKey(content: unknown): unknown {
  if (typeof content !== "object" || content === null) return content;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(content as Record<string, unknown>)) {
    if (ANSWER_KEY_FIELDS.has(key)) continue;
    clean[key] = value;
  }
  return clean;
}

/** What a student sees while actively taking a test — no answer key, no explanation/hint. */
export function toStudentQuestionDto(question: QuestionRecord) {
  return {
    id: question.id,
    type: question.type,
    text: question.text,
    content: stripAnswerKey(question.content),
    media: question.media,
    estimatedTimeSeconds: question.estimatedTimeSeconds,
  };
}

/**
 * Shuffles the *display order* of a stripped question's option-like arrays
 * (never their ids) — safe to call after stripAnswerKey since scoring always
 * matches by option id, never position. `seedKey` should be stable per
 * attempt+question so a refresh mid-test never reshuffles.
 */
export function randomizeOptionOrder(content: unknown, seedKey: string, shuffle: <T>(items: T[], key: string) => T[]): unknown {
  if (typeof content !== "object" || content === null) return content;
  const clone = { ...(content as Record<string, unknown>) };
  if (Array.isArray(clone.options)) clone.options = shuffle(clone.options, `${seedKey}:options`);
  if (Array.isArray(clone.left)) clone.left = shuffle(clone.left, `${seedKey}:left`);
  if (Array.isArray(clone.right)) clone.right = shuffle(clone.right, `${seedKey}:right`);
  return clone;
}

/** What a student sees on a published result — answer key + explanation restored, subject to Assessment.showCorrectAnswers/showSolutions. */
export function toResultQuestionDto(
  question: QuestionRecord,
  options: { showCorrectAnswers: boolean; showSolutions: boolean },
) {
  return {
    id: question.id,
    type: question.type,
    text: question.text,
    content: options.showCorrectAnswers ? question.content : stripAnswerKey(question.content),
    explanation: options.showSolutions ? question.explanation : null,
    hint: question.hint,
    difficulty: question.difficulty,
    cognitiveLevel: question.cognitiveLevel,
    skills: question.skills,
  };
}
