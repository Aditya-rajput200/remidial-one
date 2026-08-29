"use client";

import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { STATUS_LABEL, STATUS_TONE } from "@/components/assessment/status";

type AssessmentRow = {
  id: string;
  title: string;
  status: string;
  createdById: string;
  updatedAt: string;
  subject: { name: string } | null;
  _count: { modules: number; assignments: number; studentAssessments: number };
};

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/assessments?limit=100");
      if (cancelled || !res.ok) return;
      const body = await res.json();
      setAssessments(body.assessments as AssessmentRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Assessments" description="Platform-wide oversight of every mentor's tests." />
      {assessments === null ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : assessments.length === 0 ? (
        <EmptyState icon={ListChecks} title="No assessments yet" description="Assessments created by mentors will appear here." />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
          {assessments.map((a) => (
            <a key={a.id} href={`/admin/assessments/${a.id}/analytics`} className="flex items-center justify-between gap-3 p-4 hover:bg-surface">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{a.title}</p>
                  <Badge tone={STATUS_TONE[a.status] ?? "outline"}>{STATUS_LABEL[a.status] ?? a.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {a.subject?.name ?? "No subject"} · {a._count.modules} modules · {a._count.assignments} assigned ·{" "}
                  {a._count.studentAssessments} attempts
                </p>
              </div>
              <p className="text-xs text-muted-2">Updated {new Date(a.updatedAt).toLocaleDateString()}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
