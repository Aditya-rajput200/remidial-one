"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/dashboard/DashboardSkeletons";

type MentorRow = {
  id: string;
  status: string;
  subjects: { slug: string; name: string }[];
  user: { name: string; email: string; status: string };
  _count: { bookings: number };
};

const STATUS_TONE: Record<string, "lime" | "ink" | "outline"> = {
  ACTIVE: "lime",
  APPLICATION: "outline",
  UNDER_REVIEW: "outline",
  VERIFIED: "outline",
  SUSPENDED: "ink",
  REJECTED: "outline",
};

export default function AdminMentorsPage() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [mentors, setMentors] = useState<MentorRow[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    fetch(`/api/admin/mentors?${params.toString()}`)
      .then((res) => res.json())
      .then((body) => setMentors(body.mentors));
  }, [status, q]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mentors" description="All mentor accounts and their status." />

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-xs">
          <option value="">All statuses</option>
          <option value="APPLICATION">Application</option>
          <option value="UNDER_REVIEW">Under review</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </div>

      {mentors === null ? (
        <SkeletonTable rows={6} cols={4} />
      ) : mentors.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-2">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Subjects</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Bookings</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {mentors.map((mentor) => (
                <tr key={mentor.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{mentor.user.name}</div>
                    <div className="text-xs text-muted">{mentor.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{mentor.subjects.map((s) => s.name).join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[mentor.status] ?? "outline"}>{mentor.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{mentor._count.bookings}</td>
                  <td className="px-4 py-3 text-right">
                    <Button href={`/admin/mentors/${mentor.id}`} size="sm" variant="secondary-outline">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={q || status ? Search : GraduationCap} title="No mentors found" description="Try a different search or filter." />
      )}
    </div>
  );
}
