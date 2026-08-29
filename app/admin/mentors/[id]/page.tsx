"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Ban, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonDetailHeader, SkeletonTable } from "@/components/dashboard/DashboardSkeletons";

type MentorDetail = {
  id: string;
  status: string;
  bio: string | null;
  qualifications: string | null;
  teachingStyle: string | null;
  yearsExperience: number | null;
  rejectionReason: string | null;
  user: { name: string; email: string; avatarUrl: string | null; status: string; createdAt: string; country: string | null };
  subjects: { slug: string; name: string }[];
  grades: { slug: string; name: string }[];
  availability: { dayOfWeek: number; startHour: number; endHour: number }[];
  bookings: { id: string; scheduledAt: string; status: string; subject: { name: string }; student: { user: { name: string } } }[];
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminMentorDetailPage(props: PageProps<"/admin/mentors/[id]">) {
  const { id } = use(props.params);
  const [mentor, setMentor] = useState<MentorDetail | null | undefined>(undefined);
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    fetch(`/api/admin/mentors/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setMentor(body?.mentor ?? null));
  }

  useEffect(load, [id]);

  if (mentor === null) notFound();
  if (mentor === undefined) {
    return (
      <div className="flex flex-col gap-8">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <SkeletonDetailHeader />
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ink">Recent bookings</h2>
          <SkeletonTable rows={4} cols={3} />
        </div>
      </div>
    );
  }

  async function suspend() {
    if (!reason.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/mentors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "suspend", reason }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not suspend this mentor.");
      return;
    }
    setSuspending(false);
    setReason("");
    load();
  }

  async function reactivate() {
    if (!window.confirm(`Reactivate ${mentor!.user.name}?`)) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/mentors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reactivate" }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not reactivate this mentor.");
      return;
    }
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={mentor.user.name}
        description={mentor.user.email}
        action={
          mentor.status === "SUSPENDED" ? (
            <Button variant="primary-lime" size="sm" className="gap-1.5" onClick={reactivate} disabled={busy}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reactivate
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-error hover:bg-error-soft"
              onClick={() => setSuspending(true)}
              disabled={busy}
            >
              <Ban className="h-4 w-4" aria-hidden />
              Suspend
            </Button>
          )
        }
      />

      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}

      {suspending ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6">
          <h3 className="text-sm font-semibold text-ink">Suspend this mentor</h3>
          <p className="text-xs text-muted">They will no longer appear in mentor discovery and cannot receive new bookings.</p>
          <Textarea
            placeholder="Reason (required, kept in the audit log)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="primary-black" onClick={suspend} disabled={busy || !reason.trim()}>
              Confirm Suspension
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setSuspending(false); setReason(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-6">
        <Avatar src={mentor.user.avatarUrl} alt={mentor.user.name} size="lg" />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="outline">{mentor.status}</Badge>
            {mentor.subjects.map((s) => (
              <Badge key={s.slug} tone="outline">
                {s.name}
              </Badge>
            ))}
          </div>
          {mentor.bio ? <p className="text-sm text-muted">{mentor.bio}</p> : null}
          {mentor.rejectionReason ? (
            <p className="text-xs text-error">Rejection reason: {mentor.rejectionReason}</p>
          ) : null}
          {mentor.availability.length > 0 ? (
            <p className="text-xs text-muted-2">
              Availability: {mentor.availability.map((a) => `${DAY_NAMES[a.dayOfWeek]} ${a.startHour}:00–${a.endHour}:00`).join(", ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">Recent bookings</h2>
        {mentor.bookings.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-border bg-white">
            <table className="w-full min-w-[520px] text-sm">
              <tbody>
                {mentor.bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted">{new Date(b.scheduledAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-ink">{b.student.user.name}</td>
                    <td className="px-4 py-3 text-muted">{b.subject.name}</td>
                    <td className="px-4 py-3">
                      <Badge tone="outline">{b.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
