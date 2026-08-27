"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/dashboard/DashboardSkeletons";

type BookingRow = {
  id: string;
  scheduledAt: string;
  status: string;
  subject: { name: string };
  mentor: { id: string; user: { name: string } };
  student: { id: string; user: { name: string } };
};

const STATUS_TONE: Record<string, "lime" | "ink" | "outline"> = {
  CONFIRMED: "lime",
  PENDING: "outline",
  COMPLETED: "ink",
  CANCELLED: "outline",
  NO_SHOW: "outline",
};

export default function AdminBookingsPage() {
  const [status, setStatus] = useState("");
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    fetch(`/api/admin/bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((body) => setBookings(body.bookings));
  }

  useEffect(load, [status]);

  async function cancelBooking(id: string) {
    if (!reason.trim()) return;
    setBusyId(id);
    setError("");
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setBusyId(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not cancel this booking.");
      return;
    }
    setCancellingId(null);
    setReason("");
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Bookings" description="All 1-to-1 sessions across the platform." />

      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}

      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-xs">
        <option value="">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="NO_SHOW">No-show</option>
      </Select>

      {bookings === null ? (
        <SkeletonList rows={5} />
      ) : bookings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {booking.student.user.name} <span className="text-muted">with</span> {booking.mentor.user.name}
                  </p>
                  <p className="text-sm text-muted">
                    {booking.subject.name} · {new Date(booking.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[booking.status] ?? "outline"}>{booking.status}</Badge>
                  {(booking.status === "PENDING" || booking.status === "CONFIRMED") && cancellingId !== booking.id ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-error hover:bg-error-soft"
                      onClick={() => setCancellingId(booking.id)}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>

              {cancellingId === booking.id ? (
                <div className="flex flex-col gap-3 rounded-xl bg-surface p-3">
                  <Textarea
                    placeholder="Reason for cancelling (required, kept in the audit log)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[70px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary-black"
                      onClick={() => cancelBooking(booking.id)}
                      disabled={busyId === booking.id || !reason.trim()}
                    >
                      Confirm Cancellation
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setCancellingId(null); setReason(""); }}>
                      Back
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarClock} title="No bookings found" description="Try a different filter." />
      )}
    </div>
  );
}
