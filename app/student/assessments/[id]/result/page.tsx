"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

type Row = { chapterId?: string; topicId?: string; skill?: string; level?: string; attempted: number; correct: number; accuracyPercent: string };

type ResultPayload = {
  result: { totalMarksObtained: string; totalMaxMarks: string; percentage: string; accuracyPercent: string; timeSpentSeconds: number | null };
  assessment: { title: string; passingMarks: string | null };
  chapterMetrics: (Row & { chapter: { name: string } })[];
  topicMetrics: (Row & { topic: { name: string } })[];
  skillMetrics: Row[];
  cognitiveMetrics: Row[];
  aiInsight: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    timeManagementNote: string | null;
  } | null;
  feedback: { content: string }[];
};

export default function StudentResultPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<{ status: "loading" | "pending" | "ready" | "error"; data?: ResultPayload }>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const listRes = await fetch(`/api/student/assessments/${id}`);
      if (cancelled || !listRes.ok) return;
      const listBody = await listRes.json();
      const attempt = (listBody.attempts as { id: string; status: string }[]).find(
        (a) => a.status === "SUBMITTED" || a.status === "AUTO_SUBMITTED",
      );
      if (!attempt) {
        setState({ status: "error" });
        return;
      }
      const resultRes = await fetch(`/api/student/results/${attempt.id}`);
      if (cancelled) return;
      if (resultRes.status === 403) {
        setState({ status: "pending" });
        return;
      }
      if (!resultRes.ok) {
        setState({ status: "error" });
        return;
      }
      setState({ status: "ready", data: (await resultRes.json()) as ResultPayload });
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "loading") return <Skeleton className="h-96 rounded-2xl" />;

  if (state.status === "pending") {
    return (
      <EmptyState
        icon={Sparkles}
        title="Result pending"
        description="Your mentor hasn't published this result yet. Check back soon."
      />
    );
  }

  if (state.status === "error" || !state.data) {
    return <EmptyState icon={Sparkles} title="No result found" description="This assessment hasn't been completed yet." />;
  }

  const { result, assessment, chapterMetrics, topicMetrics, skillMetrics, cognitiveMetrics, aiInsight, feedback } = state.data;

  return (
    <div>
      <PageHeader title={assessment.title} description="Your performance report" />

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={TrendingUp} label="Score" value={`${result.totalMarksObtained} / ${result.totalMaxMarks}`} />
        <StatCard icon={TrendingUp} label="Percentage" value={`${Number(result.percentage).toFixed(1)}%`} />
        <StatCard icon={TrendingUp} label="Accuracy" value={`${Number(result.accuracyPercent).toFixed(1)}%`} />
        <StatCard icon={TrendingUp} label="Time Taken" value={result.timeSpentSeconds ? `${Math.round(result.timeSpentSeconds / 60)} min` : "—"} />
      </div>

      {aiInsight ? (
        <Card className="mb-6 border-lime/30 bg-lime-soft/30">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-ink">AI Learning Insight</h2>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-ink">{aiInsight.summary}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {aiInsight.strengths.length > 0 ? (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <TrendingUp className="h-3.5 w-3.5" /> Strengths
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                  {aiInsight.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {aiInsight.weaknesses.length > 0 ? (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <TrendingDown className="h-3.5 w-3.5" /> Needs Improvement
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                  {aiInsight.weaknesses.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          {aiInsight.recommendations.length > 0 ? (
            <div className="mt-4">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink">
                <Lightbulb className="h-3.5 w-3.5" /> Recommended Focus
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                {aiInsight.recommendations.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricCard title="Chapter-wise Analysis" rows={chapterMetrics.map((m) => ({ label: m.chapter.name, ...m }))} />
        <MetricCard title="Topic-wise Analysis" rows={topicMetrics.map((m) => ({ label: m.topic.name, ...m }))} />
        <MetricCard title="Skill Analysis" rows={skillMetrics.map((m) => ({ label: (m.skill ?? "").replace(/_/g, " "), ...m }))} />
        <MetricCard title="Cognitive Level Analysis" rows={cognitiveMetrics.map((m) => ({ label: m.level ?? "", ...m }))} />
      </div>

      {feedback.length > 0 ? (
        <Card className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Mentor Feedback</h2>
          <div className="flex flex-col gap-2">
            {feedback.map((f, i) => (
              <p key={i} className="text-sm text-ink">
                {f.content}
              </p>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function MetricCard({ title, rows }: { title: string; rows: { label: string; accuracyPercent: string; attempted: number }[] }) {
  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-2">No data for this breakdown.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row, i) => (
            <ProgressBar key={i} label={row.label} value={Math.round(Number(row.accuracyPercent))} />
          ))}
        </div>
      )}
    </Card>
  );
}
