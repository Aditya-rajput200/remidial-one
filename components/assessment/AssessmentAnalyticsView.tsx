"use client";

import { useEffect, useState } from "react";
import { Target, TrendingUp, Users, Clock, Send } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { STATUS_LABEL, STATUS_TONE } from "@/components/assessment/status";

type Row = { key: string; label: string; attempted: number; correct: number; marksObtained: number; maxMarks: number };

type AnalyticsData = {
  metric: {
    attemptsCount: number;
    completedCount: number;
    averageScore: string | null;
    highestScore: string | null;
    lowestScore: string | null;
    medianScore: string | null;
    averageAccuracy: string | null;
    averageTimeSeconds: number | null;
  } | null;
  chapterMetrics: Row[];
  topicMetrics: Row[];
  skillMetrics: Row[];
  cognitiveMetrics: Row[];
  students: { studentAssessmentId: string; resultId: string; name: string; percentage: string; accuracyPercent: string; status: string }[];
  questionQuality: {
    moduleQuestionId: string;
    text: string;
    type: string;
    timesAttempted: number;
    timesCorrect: number;
    timesSkipped: number;
    averageTimeSeconds: number | null;
  }[];
};

function accuracy(row: Row) {
  return row.attempted > 0 ? Math.round((row.correct / row.attempted) * 100) : 0;
}

/** Shared by both /mentor/assessments/[id]/analytics and /admin/assessments/[id]/analytics — same data, same permission-scoped API. */
export function AssessmentAnalyticsView({ id, allowPublish = true }: { id: string; allowPublish?: boolean }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");

  async function refetch() {
    const res = await fetch(`/api/assessments/${id}/analytics`);
    if (!res.ok) return;
    setData(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function publishAll() {
    setPublishing(true);
    const res = await fetch(`/api/assessments/${id}/results/publish`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    setPublishing(false);
    setPublishMessage(res.ok ? `Published ${body.published} result(s).` : body?.error ?? "Could not publish.");
    await refetch();
  }

  if (data === null) return <Skeleton className="h-96 rounded-2xl" />;

  const readyCount = data.students.filter((s) => s.status === "READY_TO_PUBLISH").length;

  return (
    <div>
      <PageHeader
        title="Assessment Analytics"
        description="Class-level performance across chapters, topics, skills, and cognitive levels."
        action={
          allowPublish && readyCount > 0 ? (
            <Button variant="primary-lime" className="gap-1.5" onClick={publishAll} disabled={publishing}>
              <Send className="h-4 w-4" /> {publishing ? "Publishing…" : `Publish ${readyCount} Result(s)`}
            </Button>
          ) : undefined
        }
      />
      {publishMessage ? <p className="mb-4 text-sm font-medium text-ink">{publishMessage}</p> : null}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Attempts" value={data.metric?.attemptsCount ?? 0} hint={`${data.metric?.completedCount ?? 0} completed`} />
        <StatCard icon={TrendingUp} label="Average Score" value={data.metric?.averageScore ? `${data.metric.averageScore}%` : "—"} />
        <StatCard icon={Target} label="Average Accuracy" value={data.metric?.averageAccuracy ? `${data.metric.averageAccuracy}%` : "—"} />
        <StatCard icon={Clock} label="Avg. Time" value={data.metric?.averageTimeSeconds ? `${Math.round(data.metric.averageTimeSeconds / 60)} min` : "—"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Chapter-wise Accuracy</h2>
          {data.chapterMetrics.length === 0 ? (
            <p className="text-sm text-muted-2">No chapter-tagged questions yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {data.chapterMetrics.map((row) => (
                <ProgressBar key={row.key} label={row.label} value={accuracy(row)} />
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Topic-wise Accuracy</h2>
          {data.topicMetrics.length === 0 ? (
            <p className="text-sm text-muted-2">No topic-tagged questions yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {data.topicMetrics.map((row) => (
                <ProgressBar key={row.key} label={row.label} value={accuracy(row)} />
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Skill Analysis</h2>
          {data.skillMetrics.length === 0 ? (
            <p className="text-sm text-muted-2">No skill-tagged questions yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {data.skillMetrics.map((row) => (
                <ProgressBar key={row.key} label={row.label.replace(/_/g, " ")} value={accuracy(row)} />
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Cognitive Level Analysis</h2>
          {data.cognitiveMetrics.length === 0 ? (
            <p className="text-sm text-muted-2">No responses yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {data.cognitiveMetrics.map((row) => (
                <ProgressBar key={row.key} label={row.label} value={accuracy(row)} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Students</h2>
        {data.students.length === 0 ? (
          <EmptyState icon={Users} title="No submissions yet" description="Once students submit, their results appear here." />
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {data.students.map((s) => (
              <div key={s.studentAssessmentId} className="flex items-center justify-between py-3">
                <p className="text-sm text-ink">{s.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">{Number(s.percentage).toFixed(1)}%</span>
                  <Badge tone={STATUS_TONE[s.status] ?? "outline"}>{STATUS_LABEL[s.status] ?? s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Question Quality</h2>
        {data.questionQuality.length === 0 ? (
          <p className="text-sm text-muted-2">No data yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {data.questionQuality.map((q) => (
              <div key={q.moduleQuestionId} className="flex items-center justify-between gap-4 py-3">
                <p className="min-w-0 flex-1 truncate text-sm text-ink">{q.text}</p>
                <p className="shrink-0 text-xs text-muted">
                  {q.timesAttempted} attempted · {q.timesCorrect} correct · {q.timesSkipped} skipped
                  {q.averageTimeSeconds ? ` · ${q.averageTimeSeconds}s avg` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
