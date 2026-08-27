"use client";

import { useState } from "react";
import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Calendar } from "@/components/dashboard/Calendar";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CalendarClock } from "lucide-react";

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default function StudentCalendarPage() {
  const { data, updateSessionStatus, rescheduleSession } = useStudentData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!data) return null;

  const daySessions = data.sessions.filter((s) => sameDay(new Date(s.date), selectedDate));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Calendar" description="See your sessions laid out by date." />

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
