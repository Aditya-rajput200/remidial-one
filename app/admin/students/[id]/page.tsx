"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { UserRound, Ban, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonDetailHeader, SkeletonTable } from "@/components/dashboard/DashboardSkeletons";

type StudentDetail = {
  id: string;
  grade: string | null;
  learningGoals: string | null;
  user: { name: string; email: string; status: string; createdAt: string; country: string | null };
  bookings: { id: string; scheduledAt: string; status: string; subject: { name: string }; mentor: { user: { name: string } } }[];
};

export default function AdminStudentDetailPage(props: PageProps<"/admin/students/[id]">) {
  const { id } = use(props.params);
  const [student, setStudent] = useState<StudentDetail | null | undefined>(undefined);
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    fetch(`/api/admin/students/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setStudent(body?.student ?? null));
  }

  useEffect(load, [id]);

  if (student === null) notFound();
  if (student === undefined) {
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
    const res = await fetch(`/api/admin/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "suspend", reason }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not suspend this student.");
      return;
    }
    setSuspending(false);
    setReason("");
    load();
  }

  async function reactivate() {
    if (!window.confirm(`Reactivate ${student!.user.name}?`)) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reactivate" }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not reactivate this student.");
      return;
    }
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={student.user.name}
        description={student.user.email}
        action={
          student.user.status === "SUSPENDED" ? (
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
          <h3 className="text-sm font-semibold text-ink">Suspend this student</h3>
          <p className="text-xs text-muted">They will be unable to log in until reactivated.</p>
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
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-muted-2">
          <UserRound className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="outline">{student.user.status}</Badge>
            {student.grade ? <Badge tone="outline">{student.grade}</Badge> : null}
          </div>
          {student.learningGoals ? <p className="text-sm text-muted">{student.learningGoals}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">Recent bookings</h2>
        {student.bookings.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-border bg-white">
            <table className="w-full min-w-[520px] text-sm">
              <tbody>
                {student.bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted">{new Date(b.scheduledAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-ink">{b.mentor.user.name}</td>
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
