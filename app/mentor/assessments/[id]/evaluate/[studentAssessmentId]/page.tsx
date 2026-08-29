"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles, ZoomIn } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

type Attachment = { id: string; fileUrl: string; fileName: string };
type Item = {
  questionAttemptId: string;
  evaluationId: string;
  evaluationStatus: string;
  maxMarks: string;
  finalMarks: string | null;
  feedback: string | null;
  question: { id: string; type: string; text: string; content: { expectedAnswer?: string; rubric?: string } };
  answer: { response: { text?: string }; attachments: Attachment[] } | null;
  aiEvaluation: {
    suggestedMarks: string | null;
    keyPointsFound: string[];
    missingConcepts: string[];
    incorrectConcepts: string[];
    suggestedFeedback: string | null;
  } | null;
};

export default function EvaluationWorkspacePage() {
  const { studentAssessmentId } = useParams<{ id: string; studentAssessmentId: string }>();
  const [items, setItems] = useState<Item[] | null>(null);
  const [marksDraft, setMarksDraft] = useState<Record<string, string>>({});
  const [feedbackDraft, setFeedbackDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refetch() {
    const res = await fetch(`/api/mentor/evaluation-queue/${studentAssessmentId}`);
    if (!res.ok) return;
    const body = await res.json();
    setItems(body.items as Item[]);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentAssessmentId]);

  async function requestAiSuggestion(evaluationId: string) {
    setBusyId(evaluationId);
    await fetch(`/api/evaluations/${evaluationId}/ai-suggest`, { method: "POST" });
    await refetch();
    setBusyId(null);
  }

  async function finalize(item: Item) {
    const marks = Number(marksDraft[item.evaluationId] ?? item.finalMarks ?? item.aiEvaluation?.suggestedMarks ?? 0);
    setBusyId(item.evaluationId);
    await fetch(`/api/evaluations/${item.evaluationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marks, feedback: feedbackDraft[item.evaluationId] ?? item.feedback ?? undefined }),
    });
    await refetch();
    setBusyId(null);
  }

  if (items === null) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div>
      <PageHeader title="Evaluate Answers" description="AI suggestions are a starting point — you always have final say on marks." />
      <div className="flex flex-col gap-5">
        {items.map((item) => (
          <Card key={item.questionAttemptId} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone="outline">{item.question.type.replace(/_/g, " ")}</Badge>
                <p className="mt-2 text-sm font-medium text-ink">{item.question.text}</p>
              </div>
              <Badge tone={item.evaluationStatus === "FINALIZED" ? "lime" : "outline"}>{item.evaluationStatus}</Badge>
            </div>

            {item.question.content.expectedAnswer ? (
              <p className="rounded-xl bg-surface p-3 text-xs text-muted">
                <strong>Expected:</strong> {item.question.content.expectedAnswer}
              </p>
            ) : null}

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Student Answer</p>
              {item.answer?.response?.text ? (
                <p className="whitespace-pre-wrap rounded-xl border border-border p-3 text-sm text-ink">{item.answer.response.text}</p>
              ) : (
                <p className="text-sm text-muted-2">(no text answer)</p>
              )}
              {item.answer?.attachments.map((att) => (
                <a key={att.id} href={att.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ink underline">
                  <ZoomIn className="h-3.5 w-3.5" /> View attachment: {att.fileName}
                </a>
              ))}
            </div>

            {item.aiEvaluation ? (
              <div className="rounded-xl border border-lime/30 bg-lime-soft/40 p-4">
                <p className="text-xs font-semibold text-ink">AI Suggestion — {item.aiEvaluation.suggestedMarks ?? "—"} / {item.maxMarks}</p>
                {item.aiEvaluation.suggestedFeedback ? <p className="mt-1 text-xs text-muted">{item.aiEvaluation.suggestedFeedback}</p> : null}
                {item.aiEvaluation.missingConcepts.length > 0 ? (
                  <p className="mt-1 text-xs text-muted">Missing: {item.aiEvaluation.missingConcepts.join(", ")}</p>
                ) : null}
              </div>
            ) : (
              <Button size="sm" variant="secondary-outline" className="w-fit gap-1.5" onClick={() => requestAiSuggestion(item.evaluationId)} disabled={busyId === item.evaluationId}>
                <Sparkles className="h-4 w-4" /> {busyId === item.evaluationId ? "Thinking…" : "Get AI Suggestion"}
              </Button>
            )}

            <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
              <div>
                <p className="mb-1 text-xs font-medium text-muted">Marks (/ {item.maxMarks})</p>
                <Input
                  type="number"
                  min={0}
                  max={Number(item.maxMarks)}
                  value={marksDraft[item.evaluationId] ?? item.finalMarks ?? item.aiEvaluation?.suggestedMarks ?? ""}
                  onChange={(e) => setMarksDraft((prev) => ({ ...prev, [item.evaluationId]: e.target.value }))}
                  disabled={item.evaluationStatus === "FINALIZED"}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted">Feedback</p>
                <Textarea
                  rows={2}
                  value={feedbackDraft[item.evaluationId] ?? item.feedback ?? item.aiEvaluation?.suggestedFeedback ?? ""}
                  onChange={(e) => setFeedbackDraft((prev) => ({ ...prev, [item.evaluationId]: e.target.value }))}
                  disabled={item.evaluationStatus === "FINALIZED"}
                />
              </div>
            </div>

            {item.evaluationStatus !== "FINALIZED" ? (
              <Button variant="primary-black" className="w-fit" onClick={() => finalize(item)} disabled={busyId === item.evaluationId}>
                Finalize Marks
              </Button>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
