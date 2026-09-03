"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Workflow, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/dashboard/DashboardSkeletons";
import { ONBOARDING_STAGES } from "@/lib/teacher/constants";

type Row = {
  id: string;
  user: { id: string; name: string; email: string };
  status: string;
  currentStage: string | null;
  completedStages: number;
  totalStages: number;
  formSubmittedAt: string | null;
  createdAt: string;
  counts: { documents: number; demos: number; counselingSessions: number };
};

const STAGE_LABEL = Object.fromEntries(ONBOARDING_STAGES.map((s) => [s.key, s.label]));

function statusTone(s: string): "lime" | "ink" | "outline" {
  if (s === "ACTIVE" || s === "VERIFIED") return "lime";
  if (s === "REJECTED") return "ink";
  return "outline";
}

export default function AdminTeacherOnboardingPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");
  const [includeApproved, setIncludeApproved] = useState(false);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (stage) params.set("stage", stage);
    if (status) params.set("status", status);
    if (includeApproved) params.set("includeApproved", "1");
    fetch(`/api/teacher-onboarding?${params}`)
      .then((r) => r.json())
      .then((b) => setRows(b.applicants ?? []));
  }, [q, stage, status, includeApproved]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Teacher Onboarding" description="Applicants moving through counseling, demo, assessment and verification." />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input placeholder="Name or email" value={q} onChange={(e) => setQ(e.target.value)} className="w-56 pl-9" />
        </div>
        <div className="w-52">
          <Select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">All stages</option>
            {ONBOARDING_STAGES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="APPLICATION">Application</option>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="NEEDS_CORRECTION">Needs correction</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={includeApproved} onChange={(e) => setIncludeApproved(e.target.checked)} />
          Include approved
        </label>
      </div>

      {rows === null ? (
        <SkeletonTable rows={6} cols={5} />
      ) : rows.length === 0 ? (
        <EmptyState icon={Workflow} title="No applicants" description="Convert a teacher lead to start an onboarding pipeline." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2.5">Applicant</th>
                <th className="px-4 py-2.5">Current stage</th>
                <th className="px-4 py-2.5">Progress</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link href={`/admin/teacher-onboarding/${r.id}`} className="font-medium text-ink hover:underline">
                      {r.user.name}
                    </Link>
                    <div className="text-xs text-muted">{r.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.currentStage ? STAGE_LABEL[r.currentStage] ?? r.currentStage : "—"}</td>
                  <td className="px-4 py-3 text-muted">{r.completedStages}/{r.totalStages}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{r.status.replaceAll("_", " ")}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {r.formSubmittedAt ? new Date(r.formSubmittedAt).toLocaleDateString("en-IN") : "Not submitted"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
