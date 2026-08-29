import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/provider";

// Explicitly forbids clinical/diagnostic language — same technique already
// used in lib/ai/nvidia.ts's system prompts. This is an educational
// performance summary, never a medical/psychological assessment (spec §31/§66).
const SYSTEM_PROMPT = `You are writing a learning-performance summary for a student's assessment report. You are given
structured performance metrics (percentage scores by chapter, topic, skill, and cognitive level, plus timing data) as
JSON. Write ONLY a JSON object with these fields:
{ "summary": "2-3 sentence overall summary", "strengths": ["..."], "weaknesses": ["..."], "conceptGaps": ["..."],
  "cognitiveGaps": ["..."], "skillGaps": ["..."], "timeManagementNote": "...", "recommendations": ["..."],
  "suggestedNextAssessment": "...", "teacherActionNote": "..." }
Use only language like "performance indicates difficulty with X" — NEVER diagnose a learning disorder, disability, or
any medical/psychological condition. Ground every claim only in the numbers given; never invent a topic or score that
isn't in the data.`;

export type GenerateInsightResult = { ok: true } | { ok: false; reason: "not_configured" | "request_failed" };

export async function generateAssessmentInsight(resultId: string): Promise<GenerateInsightResult> {
  const result = await prisma.assessmentResult.findUniqueOrThrow({
    where: { id: resultId },
    include: {
      chapterMetrics: { include: { chapter: { select: { name: true } } } },
      topicMetrics: { include: { topic: { select: { name: true } } } },
      skillMetrics: true,
      cognitiveMetrics: true,
      questionTypeMetrics: true,
    },
  });

  const metricsJson = JSON.stringify({
    overallPercentage: Number(result.percentage),
    accuracyPercent: Number(result.accuracyPercent),
    chapters: result.chapterMetrics.map((m) => ({ name: m.chapter.name, accuracyPercent: Number(m.accuracyPercent) })),
    topics: result.topicMetrics.map((m) => ({ name: m.topic.name, accuracyPercent: Number(m.accuracyPercent) })),
    skills: result.skillMetrics.map((m) => ({ skill: m.skill, accuracyPercent: Number(m.accuracyPercent) })),
    cognitiveLevels: result.cognitiveMetrics.map((m) => ({ level: m.level, accuracyPercent: Number(m.accuracyPercent) })),
    questionTypes: result.questionTypeMetrics.map((m) => ({
      type: m.type,
      accuracyPercent: Number(m.accuracyPercent),
      averageTimeSeconds: m.averageTimeSeconds,
    })),
  });

  const provider = await getAIProvider();
  const response = await provider.generateText({ system: SYSTEM_PROMPT, user: metricsJson, maxTokens: 1024, temperature: 0.4 });
  if (!response.ok) return response;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(extractJsonObject(response.data));
  } catch {
    return { ok: false, reason: "request_failed" };
  }

  await prisma.aIInsight.upsert({
    where: { resultId },
    update: {
      summary: String(parsed.summary ?? ""),
      strengths: asStringArray(parsed.strengths),
      weaknesses: asStringArray(parsed.weaknesses),
      conceptGaps: asStringArray(parsed.conceptGaps),
      cognitiveGaps: asStringArray(parsed.cognitiveGaps),
      skillGaps: asStringArray(parsed.skillGaps),
      timeManagementNote: typeof parsed.timeManagementNote === "string" ? parsed.timeManagementNote : null,
      recommendations: asStringArray(parsed.recommendations),
      suggestedNextAssessment: typeof parsed.suggestedNextAssessment === "string" ? parsed.suggestedNextAssessment : null,
      teacherActionNote: typeof parsed.teacherActionNote === "string" ? parsed.teacherActionNote : null,
      model: provider.modelName,
      generatedAt: new Date(),
    },
    create: {
      resultId,
      summary: String(parsed.summary ?? ""),
      strengths: asStringArray(parsed.strengths),
      weaknesses: asStringArray(parsed.weaknesses),
      conceptGaps: asStringArray(parsed.conceptGaps),
      cognitiveGaps: asStringArray(parsed.cognitiveGaps),
      skillGaps: asStringArray(parsed.skillGaps),
      timeManagementNote: typeof parsed.timeManagementNote === "string" ? parsed.timeManagementNote : null,
      recommendations: asStringArray(parsed.recommendations),
      suggestedNextAssessment: typeof parsed.suggestedNextAssessment === "string" ? parsed.suggestedNextAssessment : null,
      teacherActionNote: typeof parsed.teacherActionNote === "string" ? parsed.teacherActionNote : null,
      model: provider.modelName,
    },
  });

  // Recommendations also land in the standalone Recommendation table so they
  // participate in the student's cross-assessment recommendation feed
  // (spec §37) and can be individually overridden by a teacher later.
  const recommendations = asStringArray(parsed.recommendations);
  if (recommendations.length > 0) {
    const studentAssessment = await prisma.assessmentResult.findUniqueOrThrow({
      where: { id: resultId },
      select: { studentAssessment: { select: { studentId: true } } },
    });
    await prisma.recommendation.createMany({
      data: recommendations.map((content) => ({
        studentId: studentAssessment.studentAssessment.studentId,
        resultId,
        content,
        source: "AI" as const,
      })),
    });
  }

  return { ok: true };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
  return text;
}
