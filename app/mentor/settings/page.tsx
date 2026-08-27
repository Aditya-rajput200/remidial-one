"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { AvailabilitySlot } from "@/lib/data/types";

const DAYS: AvailabilitySlot["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // 8am–9pm

function isSlotActive(availability: AvailabilitySlot[], day: AvailabilitySlot["day"], hour: number) {
  return availability.some((slot) => slot.day === day && hour >= slot.startHour && hour < slot.endHour);
}

export default function MentorSettingsPage() {
  const { data, updateAvailability } = useMentorData();
  const [saved, setSaved] = useState(false);
  const [localAvailability, setLocalAvailability] = useState<AvailabilitySlot[] | null>(null);

  const availability = localAvailability ?? data?.availability ?? [];

  if (!data) return null;

  function toggleSlot(day: AvailabilitySlot["day"], hour: number) {
    const active = isSlotActive(availability, day, hour);
    let next: AvailabilitySlot[];

    if (active) {
      // Split or shrink the slot covering this hour
      next = availability.flatMap((slot) => {
        if (slot.day !== day || hour < slot.startHour || hour >= slot.endHour) return [slot];
        const parts: AvailabilitySlot[] = [];
        if (hour > slot.startHour) parts.push({ day, startHour: slot.startHour, endHour: hour });
        if (hour + 1 < slot.endHour) parts.push({ day, startHour: hour + 1, endHour: slot.endHour });
        return parts;
      });
    } else {
      next = [...availability, { day, startHour: hour, endHour: hour + 1 }];
    }

    setLocalAvailability(next);
  }

  function handleSave() {
    updateAvailability(availability);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Set your weekly availability for student bookings." />

      <div className="overflow-x-auto rounded-2xl border border-border bg-white p-4 sm:p-6">
        <div className="grid min-w-[640px] grid-cols-[60px_repeat(7,1fr)] gap-1">
          <div />
          {DAYS.map((day) => (
            <div key={day} className="pb-2 text-center text-xs font-semibold text-muted">
              {day}
            </div>
          ))}
          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              <div className="flex items-center justify-end pr-2 text-xs text-muted-2">{hour}:00</div>
              {DAYS.map((day) => {
                const active = isSlotActive(availability, day, hour);
                return (
                  <button
                    key={`${day}-${hour}`}
                    type="button"
                    onClick={() => toggleSlot(day, hour)}
                    aria-label={`${active ? "Remove" : "Add"} availability ${day} ${hour}:00`}
                    className={cn(
                      "h-6 rounded transition-colors duration-100",
                      active ? "bg-brand-gradient" : "bg-surface hover:bg-border"
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" variant="primary-lime" size="md" onClick={handleSave}>
          Save Availability
        </Button>
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-lime-ink">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Saved
          </span>
        ) : null}
      </div>
    </div>
  );
}
