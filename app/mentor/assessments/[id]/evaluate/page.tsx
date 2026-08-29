"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

type QueueRow = {
  studentAssessmentId: string;
  studentName: string;
  submittedAt: string;
  totalQuestions: number;
  pending: number;
  aiSuggested: number;
  finalized: number;
};

export default function EvaluationQueuePage() {
  const { id } = useParams<{ id: string }>();
  const [rows, setRows] = useState<QueueRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/mentor/evaluation-queue?assessmentId=${id}`);
      if (cancelled || !res.ok) return;
      const body = await res.json();
      setRows(body.rows as QueueRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div>
      <PageHeader title="Evaluation Queue" description="Review subjective answers — AI can suggest a score, but you have final say." />
      {rows === null ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Nothing to evaluate" description="Submissions with subjective questions will show up here." />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
          {rows.map((row) => (
            <a
              key={row.studentAssessmentId}
              href={`/mentor/assessments/${id}/evaluate/${row.studentAssessmentId}`}
              className="flex items-center justify-between gap-3 p-4 hover:bg-surface"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{row.studentName}</p>
                <p className="text-xs text-muted">Submitted {new Date(row.submittedAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {row.pending > 0 ? <Badge tone="outline">{row.pending} pending</Badge> : null}
                {row.aiSuggested > 0 ? <Badge tone="outline-lime">{row.aiSuggested} AI suggested</Badge> : null}
                <Badge tone={row.finalized === row.totalQuestions ? "lime" : "outline"}>
                  {row.finalized}/{row.totalQuestions} finalized
                </Badge>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
