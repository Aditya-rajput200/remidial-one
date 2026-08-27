"use client";

import { Wallet, CalendarCheck, IndianRupee } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const DEMO_HOURLY_RATE = 500;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function MentorEarningsPage() {
  const { data } = useMentorData();

  if (!data) return null;

  const completed = data.sessions.filter((s) => s.status === "completed");
  const totalEarnings = completed.reduce((sum, s) => sum + (s.durationMinutes / 60) * DEMO_HOURLY_RATE, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Earnings"
        description="An estimate of your earnings from completed sessions."
        action={<Badge tone="outline">Demo estimate — not real payments</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} value={`₹${totalEarnings.toLocaleString("en-IN")}`} label="Estimated total" hint={`At ₹${DEMO_HOURLY_RATE}/hr demo rate`} />
        <StatCard icon={CalendarCheck} value={completed.length} label="Completed sessions" />
        <StatCard icon={IndianRupee} value={`₹${DEMO_HOURLY_RATE}`} label="Demo hourly rate" />
      </div>

      {completed.length > 0 ? (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
          {completed.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 p-4 sm:p-5">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {s.subjectName} with {s.counterpartName}
                </p>
                <p className="text-xs text-muted">{formatDate(s.date)} · {s.durationMinutes} min</p>
              </div>
              <p className="text-sm font-semibold text-ink">
                ₹{Math.round((s.durationMinutes / 60) * DEMO_HOURLY_RATE).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Wallet} title="No earnings yet" description="Completed sessions will appear here with estimated earnings." />
      )}
    </div>
  );
}
