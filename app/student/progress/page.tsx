"use client";

import { Flame, MessageSquareQuote } from "lucide-react";
import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";

export default function StudentProgressPage() {
  const { data } = useStudentData();

  if (!data) return null;

  const totalSessions = data.progress.reduce((sum, p) => sum + p.sessionsCompleted, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Progress" description="How your learning is building up, subject by subject." />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={Flame} value={totalSessions} label="Total sessions completed" />
        <StatCard icon={MessageSquareQuote} value={data.progress.length} label="Subjects with mentor feedback" />
      </div>

      <div className="flex flex-col gap-4">
        {data.progress.map((entry) => (
          <div key={entry.subjectSlug} className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">{entry.subjectName}</h3>
              <span className="text-sm text-muted">{entry.sessionsCompleted} sessions</span>
            </div>
            <ProgressBar value={entry.sessionsCompleted} max={10} />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              <span className="font-medium text-ink">Mentor feedback: </span>
              {entry.lastFeedback}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
