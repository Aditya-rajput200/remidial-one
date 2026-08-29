import { questionContentSchemas, answerResponseSchemas, type QuestionTypeKey } from "@/lib/validation/question";

/**
 * Pure, DB-free scoring engine — mirrors the separation in
 * lib/stats/studentStats.ts (aggregation logic decoupled from Prisma).
 * `marks`/`negativeMarks` come from the AssessmentModuleQuestion the answer
 * was attempted under (per-use override), not Question.defaultMarks.
 */

export type ScoringResult = {
  autoScored: boolean;
  isCorrect: boolean | null;
  /** Null only for a subjective question awaiting manual evaluation. */
  marksObtained: number | null;
};

const SUBJECTIVE_TYPES: ReadonlySet<QuestionTypeKey> = new Set(["SHORT_ANSWER", "LONG_ANSWER", "IMAGE_ANSWER"]);

export function isSubjectiveType(type: QuestionTypeKey): boolean {
  return SUBJECTIVE_TYPES.has(type);
}

function finalize(isCorrect: boolean, marks: number, negativeMarks: number): ScoringResult {
  return { autoScored: true, isCorrect, marksObtained: isCorrect ? marks : -Math.abs(negativeMarks) };
}

function normalizeText(text: string, caseSensitive: boolean): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return caseSensitive ? trimmed : trimmed.toLowerCase();
}

/** Best-effort numeric parse for EQUATION comparison (e.g. "3/4" -> 0.75, "2x" left as NaN -> falls back to string match). */
function tryParseNumber(text: string): number | null {
  const cleaned = text.trim();
  if (/^-?\d+(\.\d+)?$/.test(cleaned)) return Number(cleaned);
  const fraction = cleaned.match(/^(-?\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  return null;
}

export function scoreAnswer(
  type: QuestionTypeKey,
  rawContent: unknown,
  rawResponse: unknown,
  marks: number,
  negativeMarks: number,
): ScoringResult {
  if (isSubjectiveType(type)) {
    return { autoScored: false, isCorrect: null, marksObtained: null };
  }

  switch (type) {
    case "MCQ": {
      const content = questionContentSchemas.MCQ.parse(rawContent);
      const response = answerResponseSchemas.MCQ.parse(rawResponse);
      return finalize(content.correctOptionIds[0] === response.selectedOptionId, marks, negativeMarks);
    }
    case "MULTIPLE_CORRECT": {
      const content = questionContentSchemas.MULTIPLE_CORRECT.parse(rawContent);
      const response = answerResponseSchemas.MULTIPLE_CORRECT.parse(rawResponse);
      const correct = new Set(content.correctOptionIds);
      const selected = new Set(response.selectedOptionIds);
      const isCorrect = correct.size === selected.size && [...correct].every((id) => selected.has(id));
      return finalize(isCorrect, marks, negativeMarks);
    }
    case "TRUE_FALSE": {
      const content = questionContentSchemas.TRUE_FALSE.parse(rawContent);
      const response = answerResponseSchemas.TRUE_FALSE.parse(rawResponse);
      return finalize(content.correctAnswer === response.value, marks, negativeMarks);
    }
    case "FILL_BLANK": {
      const content = questionContentSchemas.FILL_BLANK.parse(rawContent);
      const response = answerResponseSchemas.FILL_BLANK.parse(rawResponse);
      const normalizedAnswer = normalizeText(response.text, content.caseSensitive);
      const isCorrect = content.acceptedAnswers.some((a) => normalizeText(a, content.caseSensitive) === normalizedAnswer);
      return finalize(isCorrect, marks, negativeMarks);
    }
    case "MATCH_FOLLOWING": {
      const content = questionContentSchemas.MATCH_FOLLOWING.parse(rawContent);
      const response = answerResponseSchemas.MATCH_FOLLOWING.parse(rawResponse);
      const correctByLeft = new Map(content.correctPairs.map((p) => [p.leftId, p.rightId]));
      const totalPairs = content.correctPairs.length;
      const correctCount = response.pairs.filter((p) => correctByLeft.get(p.leftId) === p.rightId).length;
      // Partial credit proportional to correctly matched pairs — not in the
      // base spec, but strictly better UX than all-or-nothing for a pairing
      // question with several independent pairs.
      const fraction = totalPairs > 0 ? correctCount / totalPairs : 0;
      const isCorrect = fraction === 1;
      return { autoScored: true, isCorrect, marksObtained: isCorrect ? marks : Math.round(marks * fraction * 100) / 100 };
    }
    case "NUMERICAL": {
      const content = questionContentSchemas.NUMERICAL.parse(rawContent);
      const response = answerResponseSchemas.NUMERICAL.parse(rawResponse);
      const isCorrect = Math.abs(response.value - content.correctValue) <= content.tolerance;
      return finalize(isCorrect, marks, negativeMarks);
    }
    case "EQUATION": {
      const content = questionContentSchemas.EQUATION.parse(rawContent);
      const response = answerResponseSchemas.EQUATION.parse(rawResponse);
      const expected = tryParseNumber(content.correctExpression);
      const actual = tryParseNumber(response.text);
      const isCorrect =
        expected !== null && actual !== null
          ? Math.abs(actual - expected) <= content.tolerance
          : normalizeText(response.text, false).replace(/\s/g, "") === normalizeText(content.correctExpression, false).replace(/\s/g, "");
      return finalize(isCorrect, marks, negativeMarks);
    }
    default:
      throw new Error(`Unscoreable question type: ${type}`);
  }
}
