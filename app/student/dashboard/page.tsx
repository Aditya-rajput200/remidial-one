"use client";

import Link from "next/link";
import { CalendarClock, BookOpen, Flame, MessageSquare } from "lucide-react";
import { useSession } from "@/lib/auth/SessionProvider";
import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/dashboard/ProgressBar";

export default function StudentDashboardPage() {
  const { session } = useSession();
  const { data, updateSessionStatus, rescheduleSession } = useStudentData();

  if (!data) return null;

  const upcoming = data.sessions.filter((s) => s.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const completedCount = data.sessions.filter((s) => s.status === "completed").length;
  const nextSession = upcoming[0];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome back, ${session?.name.split(" ")[0]}`}
        description="Here's where your learning stands today."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarClock} value={upcoming.length} label="Upcoming sessions" />
        <StatCard icon={BookOpen} value={completedCount} label="Sessions completed" />
        <StatCard icon={Flame} value={data.progress.length} label="Subjects in progress" />
        <StatCard icon={MessageSquare} value={data.messages.length} label="Messages" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-ink">Upcoming session</h2>
          {nextSession ? (
            <SessionCard
              session={nextSession}
              onReschedule={rescheduleSession}
              onCancel={(id) => updateSessionStatus(id, "cancelled")}
            />
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No upcoming sessions"
              description="Book a session with your mentor to keep your learning moving."
              action={
                <Button href="/student/mentors" variant="primary-black">
                  Find a Mentor
                </Button>
              }
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ink">Subject progress</h2>
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5">
            {data.progress.map((entry) => (
              <ProgressBar
                key={entry.subjectSlug}
                label={entry.subjectName}
                value={entry.sessionsCompleted}
                max={10}
              />
            ))}
            <Link
              href="/student/progress"
              className="mt-1 text-xs font-semibold text-ink underline underline-offset-4"
            >
              View full progress
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
