"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Calendar } from "@/components/dashboard/Calendar";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCalendar } from "@/components/dashboard/DashboardSkeletons";

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default function MentorCalendarPage() {
  const { data, updateSessionStatus, rescheduleSession } = useMentorData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Calendar" description="Your sessions and availability at a glance." />
        <SkeletonCalendar />
      </div>
    );
  }

  const daySessions = data.sessions.filter((s) => sameDay(new Date(s.date), selectedDate));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Calendar" description="Your sessions and availability at a glance." />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Calendar sessions={data.sessions} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ink">
            {selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </h2>
          {daySessions.length > 0 ? (
            <div className="flex flex-col gap-4">
              {daySessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onReschedule={rescheduleSession}
                  onCancel={(id) => updateSessionStatus(id, "cancelled")}
                  onMarkComplete={(id) => updateSessionStatus(id, "completed")}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarClock} title="No sessions on this day" description="Pick another date to see scheduled sessions." />
          )}
        </div>
      </div>
    </div>
  );
}
