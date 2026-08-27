"use client";

import { CalendarClock, Users, Wallet, MessageSquare } from "lucide-react";
import { useSession } from "@/lib/auth/SessionProvider";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function MentorDashboardPage() {
  const { session } = useSession();
  const { data, updateSessionStatus, rescheduleSession } = useMentorData();

  if (!data) return null;

  const upcoming = data.sessions.filter((s) => s.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const completed = data.sessions.filter((s) => s.status === "completed");
  const uniqueStudents = new Set(data.sessions.map((s) => s.counterpartId)).size;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome back, ${session?.name.split(" ")[0]}`}
        description="Here's what's happening with your students today."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarClock} value={upcoming.length} label="Upcoming sessions" />
        <StatCard icon={Users} value={uniqueStudents} label="Active students" />
        <StatCard icon={Wallet} value={completed.length} label="Completed sessions" hint="Demo estimate" />
        <StatCard icon={MessageSquare} value={data.messages.length} label="Messages" />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">Upcoming sessions</h2>
        {upcoming.length > 0 ? (
          <div className="flex flex-col gap-4">
            {upcoming.slice(0, 3).map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onReschedule={rescheduleSession}
                onCancel={(id) => updateSessionStatus(id, "cancelled")}
                onMarkComplete={(id) => updateSessionStatus(id, "completed")}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarClock}
            title="No upcoming sessions"
            description="Once students book sessions with you, they'll show up here."
            action={
              <Button href="/mentor/settings" variant="primary-black">
                Set Your Availability
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
