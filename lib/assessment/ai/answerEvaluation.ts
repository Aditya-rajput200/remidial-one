import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/provider";
import type { Prisma } from "@/lib/generated/prisma/client";

const SYSTEM_PROMPT = `You are assisting a teacher grading a subjective exam answer. You NEVER finalize a grade — you only
suggest one, which the teacher can accept, edit, or reject. Given the question, the maximum marks, an optional expected
answer/rubric, and the student's answer, respond with ONLY a JSON object:
{ "suggestedMarks": <number, 0..maxMarks>, "keyPointsFound": ["..."], "missingConcepts": ["..."], "incorrectConcepts": ["..."], "suggestedFeedback": "..." }
Be specific and grounded only in what the student actually wrote — never invent content they didn't write.`;

export type SuggestEvaluationResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "request_failed" | "not_applicable" };

export async function suggestEvaluation(evaluationId: string): Promise<SuggestEvaluationResult> {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: {
      questionAttempt: {
        include: { question: true, moduleQuestion: true, answer: { include: { attachments: true } } },
      },
    },
  });
  if (!evaluation) return { ok: false, reason: "not_applicable" };

  const { question, moduleQuestion, answer } = evaluation.questionAttempt;
  const content = question.content as { expectedAnswer?: string; rubric?: string; instructions?: string };
  const maxMarks = Number(moduleQuestion.marks);

  const provider = await getAIProvider();
  const userPrompt = [
    `Question: ${question.text}`,
    `Maximum marks: ${maxMarks}`,
    content.expectedAnswer ? `Expected answer: ${content.expectedAnswer}` : null,
    content.rubric ? `Rubric: ${content.rubric}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const attachment = answer?.attachments[0];
  const response = attachment
    ? await provider.generateVision({
        system: SYSTEM_PROMPT,
        user: `${userPrompt}\n\nThe student's answer is the attached image (handwritten or photographed work).`,
        imageDataUrl: attachment.fileUrl,
      })
    : await provider.generateText({
        system: SYSTEM_PROMPT,
        user: `${userPrompt}\n\nStudent's answer: ${(answer?.response as { text?: string } | undefined)?.text ?? "(no answer provided)"}`,
      });

  if (!response.ok) return response;

  let parsed: {
    suggestedMarks?: number;
    keyPointsFound?: string[];
    missingConcepts?: string[];
    incorrectConcepts?: string[];
    suggestedFeedback?: string;
  };
  try {
    parsed = JSON.parse(extractJsonObject(response.data));
  } catch {
    return { ok: false, reason: "request_failed" };
  }

  const suggestedMarks =
    typeof parsed.suggestedMarks === "number" ? Math.max(0, Math.min(maxMarks, parsed.suggestedMarks)) : null;

  await prisma.aIEvaluation.upsert({
    where: { evaluationId },
    update: {
      suggestedMarks,
      keyPointsFound: parsed.keyPointsFound ?? [],
      missingConcepts: parsed.missingConcepts ?? [],
      incorrectConcepts: parsed.incorrectConcepts ?? [],
      suggestedFeedback: parsed.suggestedFeedback ?? null,
      model: provider.visionModelName && attachment ? provider.visionModelName : provider.modelName,
      rawResponse: parsed as Prisma.InputJsonValue,
    },
    create: {
      evaluationId,
      suggestedMarks,
      keyPointsFound: parsed.keyPointsFound ?? [],
      missingConcepts: parsed.missingConcepts ?? [],
      incorrectConcepts: parsed.incorrectConcepts ?? [],
      suggestedFeedback: parsed.suggestedFeedback ?? null,
      model: attachment ? provider.visionModelName : provider.modelName,
      rawResponse: parsed as Prisma.InputJsonValue,
    },
  });

  if (evaluation.status === "PENDING") {
    await prisma.evaluation.update({ where: { id: evaluationId }, data: { status: "AI_SUGGESTED" } });
  }

  return { ok: true };
}

function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
  return text;
}
