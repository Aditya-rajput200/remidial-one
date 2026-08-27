"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Check, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonSessionList } from "@/components/dashboard/DashboardSkeletons";

type Application = {
  id: string;
  status: string;
  bio: string | null;
  qualifications: string | null;
  yearsExperience: number | null;
  user: { id: string; name: string; email: string; createdAt: string };
};

export default function MentorApplicationsPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/mentor-applications")
      .then((res) => res.json())
      .then((body) => setApplications(body.applications));
  }

  useEffect(load, []);

  async function approve(id: string) {
    setBusyId(id);
    setError("");
    const res = await fetch(`/api/admin/mentor-applications/${id}/approve`, { method: "POST" });
    setBusyId(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not approve this application.");
      return;
    }
    load();
  }

  async function reject(id: string) {
    if (!reason.trim()) return;
    setBusyId(id);
    setError("");
    const res = await fetch(`/api/admin/mentor-applications/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setBusyId(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not reject this application.");
      return;
    }
    setRejectingId(null);
    setReason("");
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mentor Applications" description="Review and approve mentors before they appear in discovery." />

      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}

      {applications === null ? (
        <SkeletonSessionList count={3} />
      ) : applications.length > 0 ? (
        <div className="flex flex-col gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{app.user.name}</h3>
                  <p className="text-sm text-muted">{app.user.email}</p>
                </div>
                <Badge tone="outline">Applied {new Date(app.user.createdAt).toLocaleDateString()}</Badge>
              </div>

              {app.bio ? <p className="text-sm text-muted">{app.bio}</p> : null}
              {app.qualifications ? <p className="text-xs text-muted-2">{app.qualifications}</p> : null}
              {app.yearsExperience != null ? (
                <p className="text-xs text-muted-2">{app.yearsExperience} years experience</p>
              ) : null}

              {rejectingId === app.id ? (
                <div className="flex flex-col gap-3 rounded-xl bg-surface p-3">
                  <Textarea
                    placeholder="Reason for rejection (shown internally, required)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary-black"
                      onClick={() => reject(app.id)}
                      disabled={busyId === app.id || !reason.trim()}
                    >
                      Confirm Rejection
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setRejectingId(null); setReason(""); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary-lime"
                    className="gap-1.5"
                    onClick={() => approve(app.id)}
                    disabled={busyId === app.id}
                  >
                    <Check className="h-4 w-4" aria-hidden />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-error hover:bg-error-soft"
                    onClick={() => setRejectingId(app.id)}
                    disabled={busyId === app.id}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={ClipboardCheck} title="No pending applications" description="New mentor applications will show up here for review." />
      )}
    </div>
  );
}
