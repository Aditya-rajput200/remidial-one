"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Star, Sparkles, RefreshCw, MessageSquareQuote } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonStatCards } from "@/components/dashboard/DashboardSkeletons";
import { computeStudentStats } from "@/lib/stats/studentStats";
import { cn } from "@/lib/cn";

const CHART_COLORS = {
  lime: "#2fb201",
  limeDeep: "#248900",
  muted: "#8a8d84",
  border: "#e6e7e0",
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

type InsightState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; insight: string }
  | { status: "unavailable"; reason: string };

function AiInsightCard({ enabled }: { enabled: boolean }) {
  const [state, setState] = useState<InsightState>({ status: "idle" });

  async function generate() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/students/me/insights", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.insight) {
        const reason =
          body?.reason === "not_configured"
            ? "AI insights aren't set up yet — an NVIDIA API key needs to be added."
            : "Could not generate an insight right now. Try again in a moment.";
        setState({ status: "unavailable", reason });
        return;
      }
      setState({ status: "ready", insight: body.insight });
    } catch {
      setState({ status: "unavailable", reason: "Could not reach the AI service. Check your connection and try again." });
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (enabled) generate();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-lime/30 bg-lime-soft/40 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">AI Insight</h3>
            <p className="text-xs text-muted-2">Generated from your session scores</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 gap-1.5"
          onClick={generate}
          disabled={state.status === "loading"}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", state.status === "loading" && "animate-spin")} aria-hidden />
          Regenerate
        </Button>
      </div>

      {state.status === "loading" || state.status === "idle" ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      ) : state.status === "ready" ? (
        <p className="text-sm leading-relaxed text-ink">{state.insight}</p>
      ) : (
        <p className="text-sm text-muted">{state.reason}</p>
      )}
    </div>
  );
}

export default function StudentProgressPage() {
  const { data } = useStudentData();

  const stats = useMemo(() => {
    if (!data) return null;
    const completed = data.sessions
      .filter((s) => s.status === "completed")
      .map((s) => ({
        id: s.id,
        date: s.date,
        subjectSlug: s.subjectSlug,
        subjectName: s.subjectName,
        mentorRating: s.mentorRating ?? null,
      }));
    return computeStudentStats(completed);
  }, [data]);

  if (!data || !stats) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Progress" description="Your scores and stats, subject by subject." />
        <SkeletonStatCards count={4} />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (stats.totalSessions === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Progress" description="Your scores and stats, subject by subject." />
        <EmptyState
          icon={Flame}
          title="No sessions yet"
          description="Complete your first session to start building your stats and score history here."
        />
      </div>
    );
  }

  const trendData = stats.trend.map((t) => ({ date: formatShortDate(t.date), rating: t.rating }));
  const subjectData = stats.bySubject.map((s) => ({ name: s.subjectName, average: s.average, count: s.count }));
  const topSubject = stats.bySubject[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Progress" description="Your scores and stats, subject by subject." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Star}
          value={stats.averageScore != null ? `${stats.averageScore}/10` : "—"}
          label="Average score"
          hint={
            stats.recentTrendDelta != null
              ? `${stats.recentTrendDelta > 0 ? "+" : ""}${stats.recentTrendDelta} recently`
              : undefined
          }
        />
        <StatCard icon={Flame} value={stats.totalSessions} label="Sessions completed" />
        <StatCard icon={MessageSquareQuote} value={stats.ratedSessions} label="Sessions scored by mentors" />
        <StatCard
          icon={Star}
          value={topSubject?.subjectName ?? "—"}
          label="Strongest subject"
          hint={topSubject ? `${topSubject.average}/10 avg` : undefined}
        />
      </div>

      <AiInsightCard enabled={stats.ratedSessions > 0} />

      {stats.ratedSessions > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
            <h3 className="text-base font-semibold text-ink">Score trend</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_COLORS.border} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_COLORS.border}`, fontSize: 13 }}
                    formatter={(value) => [`${value}/10`, "Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke={CHART_COLORS.limeDeep}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: CHART_COLORS.limeDeep }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
            <h3 className="text-base font-semibold text-ink">Score by subject</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_COLORS.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: `1px solid ${CHART_COLORS.border}`, fontSize: 13 }}
                    formatter={(value, _name, item) => [`${value}/10 (${item.payload.count} sessions)`, "Average"]}
                  />
                  <Bar dataKey="average" fill={CHART_COLORS.lime} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="No scores yet"
          description="Once your mentor scores a completed session, your stats and charts will show up here."
        />
      )}
    </div>
  );
}
