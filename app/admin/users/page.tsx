"use client";

import { useEffect, useState } from "react";
import { UsersRound, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/dashboard/DashboardSkeletons";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

const ROLE_OPTIONS = [
  "STUDENT",
  "MENTOR",
  "PARENT",
  "ADMIN",
  "SUPER_ADMIN",
  "CONTENT_MANAGER",
  "SUPPORT_AGENT",
  "FINANCE_MANAGER",
  "MODERATOR",
];

const STATUS_TONE: Record<string, "lime" | "ink" | "outline"> = {
  ACTIVE: "lime",
  PENDING_VERIFICATION: "outline",
  SUSPENDED: "ink",
  DISABLED: "ink",
};

function roleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    fetch(`/api/admin/users?${params.toString()}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
        return body;
      })
      .then((body) => {
        setError("");
        setUsers(body.users);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load users."));
  }, [q, role]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users & Roles"
        description="Every account on the platform. Change a role or grant/revoke individual permissions from a user's detail page."
      />

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="max-w-xs">
          <option value="">All roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {roleLabel(r)}
            </option>
          ))}
        </Select>
      </div>

      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}

      {users === null && !error ? (
        <SkeletonTable rows={6} cols={4} />
      ) : users && users.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-2">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{user.name}</div>
                    <div className="text-xs text-muted">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="outline">{roleLabel(user.role)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[user.status] ?? "outline"}>{user.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Button href={`/admin/users/${user.id}`} size="sm" variant="secondary-outline">
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={q || role ? Search : UsersRound} title="No users found" description="Try a different search or filter." />
      )}
    </div>
  );
}
