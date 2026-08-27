"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DashboardSession } from "@/lib/data/types";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function Calendar({
  sessions,
  selectedDate,
  onSelectDate,
}: {
  sessions: DashboardSession[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // Monday-first offset
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [viewDate]);

  const today = new Date();

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink">
          {viewDate.toLocaleString("en-IN", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-2">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;

          const daySessions = sessions.filter((s) => sameDay(new Date(s.date), date));
          const isSelected = sameDay(date, selectedDate);
          const isToday = sameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition-colors duration-150",
                isSelected ? "bg-ink text-white" : "text-ink hover:bg-surface",
                !isSelected && isToday && "font-semibold text-lime-ink"
              )}
            >
              {date.getDate()}
              {daySessions.length > 0 ? (
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    isSelected ? "bg-lime" : "bg-lime-ink"
                  )}
                  aria-hidden
                />
              ) : (
                <span className="h-1 w-1" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
