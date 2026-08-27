"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/dashboard/DashboardSkeletons";

type AuditRow = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
  actor: { name: string; email: string; role: string } | null;
};

export default function AdminAuditPage() {
  const [action, setAction] = useState("");
  const [logs, setLogs] = useState<AuditRow[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    fetch(`/api/admin/audit?${params.toString()}`)
      .then((res) => res.json())
      .then((body) => setLogs(body.logs));
  }, [action]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Audit Log" description="Every sensitive admin and account action, in order." />

      <Input
        placeholder="Filter by exact action (e.g. MENTOR_APPROVED)"
        value={action}
        onChange={(e) => setAction(e.target.value)}
        className="max-w-sm"
      />

      {logs === null ? (
        <SkeletonTable rows={8} cols={5} />
      ) : logs.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-2">
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border align-top last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {log.actor ? (
                      <>
                        <div className="font-medium text-ink">{log.actor.name}</div>
                        <div className="text-xs text-muted">{log.actor.role}</div>
                      </>
                    ) : (
                      <span className="text-muted">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="outline">{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {log.resourceType}
                    {log.resourceId ? <span className="text-xs text-muted-2"> · {log.resourceId}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-2">{log.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={ShieldCheck} title="No audit entries found" description="Try a different filter." />
      )}
    </div>
  );
}
