"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { subjects } from "@/lib/content/subjects";
import { classBands } from "@/lib/content/classes";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const timeSlots = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "weekend", label: "Weekend" },
];

export function QuickMatchCard({ className }: { className?: string }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [classBand, setClassBand] = useState("");
  const [time, setTime] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (time) params.set("time", time);
    const query = params.toString() ? `?${params.toString()}` : "";

    if (subject) {
      router.push(`/subjects/${subject}${query}`);
    } else if (classBand) {
      router.push(`/classes/${classBand}${query}`);
    } else {
      router.push(`/mentors${query}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-5 rounded-3xl border border-border bg-white p-6 shadow-lift ${className ?? ""}`}
    >
      <h3 className="text-xl font-semibold leading-snug tracking-tight text-ink">
        Find the right mentor for <span className="text-lime-ink">your goals</span>
      </h3>

      <div className="flex flex-col gap-4">
        <FormField label="I want to learn" htmlFor="quick-subject">
          <Select
            id="quick-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Class / Grade" htmlFor="quick-class">
          <Select
            id="quick-class"
            value={classBand}
            onChange={(event) => setClassBand(event.target.value)}
          >
            <option value="">Select class</option>
            {classBands.map((band) => (
              <option key={band.slug} value={band.slug}>
                {band.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Preferred Time" htmlFor="quick-time">
          <Select id="quick-time" value={time} onChange={(event) => setTime(event.target.value)}>
            <option value="">Select time</option>
            {timeSlots.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <Button type="submit" variant="primary-black" size="lg" className="w-full gap-2">
        Find Mentors
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </form>
  );
}
