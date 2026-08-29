"use client";

import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

type AssessmentCard = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  durationMinutes: number;
  totalMarks: string;
  startAt: string | null;
  endAt: string | null;
  subject: { name: string } | null;
  _count: { modules: number };
  attempts: { id: string; status: string; attemptNumber: number }[];
};

type Tab = "live" | "upcoming" | "completed";

function classify(a: AssessmentCard): Tab {
  const hasSubmitted = a.attempts.some((att) => att.status === "SUBMITTED" || att.status === "AUTO_SUBMITTED");
  if (hasSubmitted) return "completed";
  if (a.status === "LIVE" || a.status === "PAUSED") return "live";
  return "upcoming";
}

export default function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentCard[] | null>(null);
  const [tab, setTab] = useState<Tab>("live");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/student/assessments");
      if (cancelled || !res.ok) return;
      const body = await res.json();
      setAssessments(body.assessments as AssessmentCard[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = assessments?.filter((a) => classify(a) === tab) ?? [];

  return (
    <div>
      <PageHeader title="Assessments" description="Tests assigned to you by your mentors." />

      <div className="mb-6 flex gap-1 rounded-full bg-surface p-1 w-fit">
        {(["live", "upcoming", "completed"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-white text-ink shadow-card" : "text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {assessments === null ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ListChecks} title={`No ${tab} assessments`} description="Check back later — your mentor will assign tests here." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5">
              <div className="flex items-center justify-between">
                <Badge tone="outline">{a.subject?.name ?? "General"}</Badge>
                {tab === "live" ? <Badge tone="lime">Live</Badge> : null}
              </div>
              <h3 className="text-base font-semibold text-ink">{a.title}</h3>
              <p className="text-xs text-muted">
                {a._count.modules} modules · {a.durationMinutes} min · {a.totalMarks} marks
              </p>
              {tab === "live" ? (
                <Button href={`/student/assessments/${a.id}/instructions`} variant="primary-lime" size="sm">
                  {a.attempts.some((att) => att.status === "IN_PROGRESS") ? "Resume Test" : "Start Test"}
                </Button>
              ) : tab === "completed" ? (
                <Button href={`/student/assessments/${a.id}/result`} variant="secondary-outline" size="sm">
                  View Result
                </Button>
              ) : (
                <p className="text-xs font-medium text-muted-2">
                  {a.startAt ? `Opens ${new Date(a.startAt).toLocaleString()}` : "Not scheduled yet"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
