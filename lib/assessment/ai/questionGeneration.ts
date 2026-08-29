import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/provider";
import { questionContentSchemas, type QuestionTypeKey } from "@/lib/validation/question";
import type { Prisma } from "@/lib/generated/prisma/client";

export type GenerateQuestionsSpec = {
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  typeCounts: Partial<Record<QuestionTypeKey, number>>;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "VERY_HARD";
  cognitiveLevel: "REMEMBER" | "UNDERSTAND" | "APPLY" | "ANALYZE" | "EVALUATE" | "CREATE";
  skills: string[];
  topicHint?: string;
};

const SYSTEM_PROMPT = `You are an expert exam-item writer. Given a request describing a subject/topic and a set of
question types with counts, output ONLY a JSON array (no markdown, no prose) of question objects. Each object must be:
{ "type": "<QuestionType>", "text": "<question text>", "explanation": "<why the answer is correct>", "content": <type-specific payload> }

Type-specific "content" payloads:
- MCQ: { "options": [{"id":"a","text":"..."}, ...4 options], "correctOptionIds": ["a"] }
- MULTIPLE_CORRECT: { "options": [{"id":"a","text":"..."}, ...4 options], "correctOptionIds": ["a","c"] }
- TRUE_FALSE: { "correctAnswer": true }
- FILL_BLANK: { "acceptedAnswers": ["answer"], "caseSensitive": false }
- MATCH_FOLLOWING: { "left": [{"id":"l1","text":"..."}], "right": [{"id":"r1","text":"..."}], "correctPairs": [{"leftId":"l1","rightId":"r1"}] }
- SHORT_ANSWER / LONG_ANSWER: { "expectedAnswer": "...", "rubric": "..." }
- IMAGE_ANSWER: { "instructions": "..." }
- NUMERICAL: { "correctValue": 42, "tolerance": 0 }
- EQUATION: { "correctExpression": "x=5", "tolerance": 0 }

Never invent facts outside the requested topic. Never leave an answer key field empty or contradictory to the explanation.`;

type GeneratedRaw = { type: string; text: string; explanation?: string; content: unknown };

export type QuestionGenerationResult =
  | { ok: true; created: number; rejected: number; questionIds: string[] }
  | { ok: false; reason: "not_configured" | "request_failed" | "no_valid_questions" };

export async function generateQuestions(
  createdById: string,
  spec: GenerateQuestionsSpec,
): Promise<QuestionGenerationResult> {
  const provider = await getAIProvider();

  const typeList = Object.entries(spec.typeCounts)
    .filter(([, count]) => (count ?? 0) > 0)
    .map(([type, count]) => `${count}x ${type}`)
    .join(", ");

  const userPrompt = [
    spec.topicHint ? `Topic: ${spec.topicHint}` : null,
    `Difficulty: ${spec.difficulty}`,
    `Cognitive level: ${spec.cognitiveLevel}`,
    spec.skills.length > 0 ? `Target skills: ${spec.skills.join(", ")}` : null,
    `Generate exactly: ${typeList}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await provider.generateText({ system: SYSTEM_PROMPT, user: userPrompt, maxTokens: 4096, temperature: 0.4 });
  if (!result.ok) return result;

  let parsed: GeneratedRaw[];
  try {
    const jsonText = extractJsonArray(result.data);
    parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) throw new Error("not an array");
  } catch {
    return { ok: false, reason: "request_failed" };
  }

  const existingTexts = new Set(
    (
      await prisma.question.findMany({
        where: { createdById, subjectId: spec.subjectId },
        select: { text: true },
      })
    ).map((q) => normalize(q.text)),
  );

  const toCreate: Prisma.QuestionCreateManyInput[] = [];
  let rejected = 0;

  for (const raw of parsed) {
    const type = raw.type as QuestionTypeKey;
    const schema = questionContentSchemas[type];
    if (!schema || typeof raw.text !== "string" || !raw.text.trim()) {
      rejected += 1;
      continue;
    }
    if (existingTexts.has(normalize(raw.text))) {
      rejected += 1; // duplicate-text safety check (spec §38)
      continue;
    }
    const contentResult = schema.safeParse(raw.content);
    if (!contentResult.success) {
      rejected += 1;
      continue;
    }

    existingTexts.add(normalize(raw.text));
    toCreate.push({
      createdById,
      subjectId: spec.subjectId,
      chapterId: spec.chapterId,
      topicId: spec.topicId,
      type,
      difficulty: spec.difficulty,
      cognitiveLevel: spec.cognitiveLevel,
      skills: spec.skills as never,
      text: raw.text.trim(),
      explanation: typeof raw.explanation === "string" ? raw.explanation : null,
      content: contentResult.data as Prisma.InputJsonValue,
      source: "AI_GENERATED",
      status: "DRAFT",
      aiMeta: { model: provider.modelName, spec } as Prisma.InputJsonValue,
    });
  }

  if (toCreate.length === 0) return { ok: false, reason: "no_valid_questions" };

  await prisma.question.createMany({ data: toCreate });
  const created = await prisma.question.findMany({
    where: { createdById, source: "AI_GENERATED", text: { in: toCreate.map((q) => q.text as string) } },
    select: { id: true },
    orderBy: { createdAt: "desc" },
    take: toCreate.length,
  });

  return { ok: true, created: toCreate.length, rejected, questionIds: created.map((q) => q.id) };
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Strips markdown code fences a model sometimes wraps the JSON in, despite instructions not to. */
function extractJsonArray(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
  return text;
}
