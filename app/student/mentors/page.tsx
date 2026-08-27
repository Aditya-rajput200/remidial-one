"use client";

import { UserRound } from "lucide-react";
import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCardGrid } from "@/components/dashboard/DashboardSkeletons";

export default function StudentMentorsPage() {
  const { data } = useStudentData();

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="My Mentors" description="Mentors you've connected with for 1-to-1 sessions." />
        <SkeletonCardGrid count={3} />
      </div>
    );
  }

  const mentors = Array.from(
    new Map(data.sessions.map((s) => [s.counterpartId, { id: s.counterpartId, name: s.counterpartName }])).values()
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Mentors" description="Mentors you've connected with for 1-to-1 sessions." />

      {mentors.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <Card key={mentor.id} interactive className="flex flex-col gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted-2">
                <UserRound className="h-7 w-7" strokeWidth={1.5} aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">{mentor.name}</h3>
              </div>
              <div className="flex gap-2">
                <Button href={`/student/mentors/${mentor.id}`} size="sm" variant="secondary-outline">
                  View Profile
                </Button>
                <Button href="/student/messages" size="sm" variant="ghost">
                  Message
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UserRound}
          title="No mentors yet"
          description="Once you book your first session, your mentors will show up here."
          action={
            <Button href="/student/find-mentors" variant="primary-black">
              Find a Mentor
            </Button>
          }
        />
      )}
    </div>
  );
}
