"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { UserRound, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonDetailHeader } from "@/components/dashboard/DashboardSkeletons";
import { useSession } from "@/lib/auth/SessionProvider";
import { PERMISSIONS, type PermissionKey } from "@/lib/auth/permissions";

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

const PERMISSION_KEYS = Object.keys(PERMISSIONS) as PermissionKey[];

function roleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type Override = {
  id: string;
  effect: "GRANT" | "REVOKE";
  reason: string | null;
  createdAt: string;
  permission: { key: string; description: string };
};

type UserDetail = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  userPermissions: Override[];
};

export default function AdminUserDetailPage(props: PageProps<"/admin/users/[id]">) {
  const { id } = use(props.params);
  const { session } = useSession();
  const [user, setUser] = useState<UserDetail | null | undefined>(undefined);
  const [effectivePermissions, setEffectivePermissions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [role, setRole] = useState("");
  const [newPermission, setNewPermission] = useState<PermissionKey>(PERMISSION_KEYS[0]);
  const [newEffect, setNewEffect] = useState<"GRANT" | "REVOKE">("GRANT");
  const [newReason, setNewReason] = useState("");

  function load() {
    fetch(`/api/admin/users/${id}`)
      .then(async (res) => {
        if (res.status === 404) return null;
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
        return body;
      })
      .then((body) => {
        if (body === null) {
          setUser(null);
          return;
        }
        setUser(body.user);
        setEffectivePermissions(body.effectivePermissions);
        setRole(body.user.role);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load this user."));
  }

  useEffect(load, [id]);

  if (user === null) notFound();
  if (user === undefined) {
    return (
      <div className="flex flex-col gap-8">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <SkeletonDetailHeader />
      </div>
    );
  }

  const isSelf = session?.id === user.id;

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const responseBody = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(responseBody?.error || `Request failed (${res.status})`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={user.name} description={user.email} />

      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-muted-2">
          <UserRound className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="outline">{user.status}</Badge>
            <Badge tone="lime">{roleLabel(user.role)}</Badge>
          </div>
          <p className="text-xs text-muted">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6">
        <h2 className="text-sm font-semibold text-ink">Role</h2>
        {isSelf ? (
          <p className="text-sm text-muted">You can&apos;t change your own role — ask another Super Admin.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={role} onChange={(e) => setRole(e.target.value)} className="max-w-xs" disabled={busy}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              variant="primary-black"
              disabled={busy || role === user.role}
              onClick={() => patch({ action: "change_role", role })}
            >
              Save Role
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-2">
          Changing role resets this account to that role&apos;s default permissions, plus any overrides below.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
        <h2 className="text-sm font-semibold text-ink">Permission overrides</h2>
        <p className="text-xs text-muted">
          Grant an extra permission this role doesn&apos;t normally have, or revoke one it does — use sparingly.
        </p>

        {user.userPermissions.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {user.userPermissions.map((override) => (
              <li
                key={override.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2"
              >
                <div>
                  <span className="flex items-center gap-2 text-sm">
                    <Badge tone={override.effect === "GRANT" ? "lime" : "outline"}>{override.effect}</Badge>
                    <span className="font-medium text-ink">{override.permission.key}</span>
                  </span>
                  <p className="mt-0.5 text-xs text-muted">{override.permission.description}</p>
                  {override.reason ? <p className="text-xs text-muted-2">Reason: {override.reason}</p> : null}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-error hover:bg-error-soft"
                  disabled={busy}
                  onClick={() => patch({ action: "remove_override", permissionKey: override.permission.key })}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-2">No overrides — this account uses its role&apos;s default permissions only.</p>
        )}

        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-muted">Permission</span>
            <Select
              value={newPermission}
              onChange={(e) => setNewPermission(e.target.value as PermissionKey)}
              className="h-9 text-sm"
            >
              {PERMISSION_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Effect</span>
            <Select
              value={newEffect}
              onChange={(e) => setNewEffect(e.target.value as "GRANT" | "REVOKE")}
              className="h-9 max-w-[8rem] text-sm"
            >
              <option value="GRANT">Grant</option>
              <option value="REVOKE">Revoke</option>
            </Select>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-muted">Reason (optional)</span>
            <Input value={newReason} onChange={(e) => setNewReason(e.target.value)} className="h-9 text-sm" />
          </div>
          <Button
            size="sm"
            variant="secondary-outline"
            disabled={busy}
            onClick={() => {
              patch({
                action: newEffect === "GRANT" ? "grant_permission" : "revoke_permission",
                permissionKey: newPermission,
                reason: newReason || undefined,
              });
              setNewReason("");
            }}
          >
            Add Override
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6">
        <h2 className="text-sm font-semibold text-ink">Effective permissions ({effectivePermissions.length})</h2>
        <div className="flex flex-wrap gap-1.5">
          {effectivePermissions.map((key) => (
            <Badge key={key} tone="outline">
              {key}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
