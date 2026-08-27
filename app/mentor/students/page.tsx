"use client";

import { UserRound, UsersRound } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCardGrid } from "@/components/dashboard/DashboardSkeletons";

export default function MentorStudentsPage() {
  const { data } = useMentorData();

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="My Students" description="Students you're currently mentoring." />
        <SkeletonCardGrid count={3} />
      </div>
    );
  }

  const students = Array.from(
    new Map(data.sessions.map((s) => [s.counterpartId, { id: s.counterpartId, name: s.counterpartName }])).values()
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Students" description="Students you're currently mentoring." />

      {students.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id} interactive className="flex flex-col gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted-2">
                <UserRound className="h-7 w-7" strokeWidth={1.5} aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">{student.name}</h3>
              </div>
              <div className="flex gap-2">
                <Button href={`/mentor/students/${student.id}`} size="sm" variant="secondary-outline">
                  View Details
                </Button>
                <Button href="/mentor/messages" size="sm" variant="ghost">
                  Message
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UsersRound}
          title="No students yet"
          description="Once a student books a session with you, they'll appear here."
        />
      )}
    </div>
  );
}
