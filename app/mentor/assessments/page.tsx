"use client";

import { useEffect, useState } from "react";
import { ListChecks, Plus, FileEdit, CalendarClock, ClipboardCheck, CheckCircle2, Library } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { STATUS_TONE, STATUS_LABEL } from "@/components/assessment/status";

type AssessmentRow = {
  id: string;
  title: string;
  status: string;
  durationMinutes: number;
  totalMarks: string;
  updatedAt: string;
  subject: { name: string } | null;
  _count: { modules: number; assignments: number; studentAssessments: number };
};

export default function MentorAssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/assessments");
      if (cancelled || !res.ok) return;
      const body = await res.json();
      setAssessments(body.assessments as AssessmentRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = assessments
    ? {
        draft: assessments.filter((a) => a.status === "DRAFT" || a.status === "REVIEW").length,
        scheduled: assessments.filter((a) => a.status === "SCHEDULED").length,
        live: assessments.filter((a) => a.status === "LIVE" || a.status === "PAUSED").length,
        pendingEval: assessments.filter((a) => a.status === "EVALUATION").length,
        published: assessments.filter((a) => a.status === "RESULT_READY" || a.status === "ARCHIVED").length,
      }
    : null;

  return (
    <div>
      <PageHeader
        title="Assessments"
        description="Create, run, and evaluate tests for your students."
        action={
          <div className="flex gap-3">
            <Button href="/mentor/assessments/question-bank" variant="secondary-outline" size="md" className="gap-2">
              <Library className="h-4 w-4" aria-hidden />
              Question Bank
            </Button>
            <Button href="/mentor/assessments/new" variant="primary-lime" size="md" className="gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Create Assessment
            </Button>
          </div>
        }
      />

      {counts ? (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={FileEdit} label="Drafts" value={counts.draft} />
          <StatCard icon={CalendarClock} label="Scheduled" value={counts.scheduled} />
          <StatCard icon={ListChecks} label="Live" value={counts.live} />
          <StatCard icon={ClipboardCheck} label="Pending Evaluation" value={counts.pendingEval} />
          <StatCard icon={CheckCircle2} label="Results Ready" value={counts.published} />
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {assessments === null ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : assessments.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No assessments created yet"
          description="Build your first test — add modules, questions, and publish it to your students."
          action={
            <Button href="/mentor/assessments/new" variant="primary-black">
              Create Assessment
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
          {assessments.map((a) => (
            <a
              key={a.id}
              href={
                a.status === "DRAFT" || a.status === "REVIEW"
                  ? `/mentor/assessments/${a.id}/builder`
                  : a.status === "EVALUATION"
                    ? `/mentor/assessments/${a.id}/evaluate`
                    : `/mentor/assessments/${a.id}/analytics`
              }
              className="flex flex-col gap-3 p-5 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-ink">{a.title}</p>
                  <Badge tone={STATUS_TONE[a.status] ?? "outline"}>{STATUS_LABEL[a.status] ?? a.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {a.subject?.name ?? "No subject"} · {a._count.modules} modules · {a.durationMinutes} min ·{" "}
                  {a._count.assignments} assigned · {a._count.studentAssessments} attempts
                </p>
              </div>
              <p className="shrink-0 text-xs text-muted-2">Updated {new Date(a.updatedAt).toLocaleDateString()}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
