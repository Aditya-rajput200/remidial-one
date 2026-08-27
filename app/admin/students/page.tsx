"use client";

import { useEffect, useState } from "react";
import { UsersRound, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/dashboard/DashboardSkeletons";

type StudentRow = {
  id: string;
  grade: string | null;
  user: { name: string; email: string; status: string };
  _count: { bookings: number };
};

const STATUS_TONE: Record<string, "lime" | "ink" | "outline"> = {
  ACTIVE: "lime",
  PENDING_VERIFICATION: "outline",
  SUSPENDED: "ink",
  DISABLED: "ink",
};

export default function AdminStudentsPage() {
  const [q, setQ] = useState("");
  const [students, setStudents] = useState<StudentRow[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    fetch(`/api/admin/students?${params.toString()}`)
      .then((res) => res.json())
      .then((body) => setStudents(body.students));
  }, [q]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Students" description="All student accounts." />

      <Input placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />

      {students === null ? (
        <SkeletonTable rows={6} cols={4} />
      ) : students.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-2">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Bookings</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{student.user.name}</div>
                    <div className="text-xs text-muted">{student.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{student.grade ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[student.user.status] ?? "outline"}>{student.user.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{student._count.bookings}</td>
                  <td className="px-4 py-3 text-right">
                    <Button href={`/admin/students/${student.id}`} size="sm" variant="secondary-outline">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={q ? Search : UsersRound} title="No students found" description="Try a different search." />
      )}
    </div>
  );
}
