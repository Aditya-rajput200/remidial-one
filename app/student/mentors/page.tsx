"use client";

import { UserRound } from "lucide-react";
import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEMO_MENTOR } from "@/lib/data/types";

export default function StudentMentorsPage() {
  const { data } = useStudentData();

  if (!data) return null;

  const hasMentor = data.sessions.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Mentors" description="Mentors you've connected with for 1-to-1 sessions." />

      {hasMentor ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card interactive className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted-2">
                <UserRound className="h-7 w-7" strokeWidth={1.5} aria-hidden />
              </div>
              <Badge tone="outline">Demo</Badge>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">{DEMO_MENTOR.name}</h3>
              <p className="text-sm text-muted">{DEMO_MENTOR.role}</p>
            </div>
            <div className="flex gap-2">
              <Button href={`/student/mentors/${DEMO_MENTOR.id}`} size="sm" variant="secondary-outline">
                View Profile
              </Button>
              <Button href={`/student/messages`} size="sm" variant="ghost">
                Message
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={UserRound}
          title="No mentors yet"
          description="Once you book your first session, your mentors will show up here."
          action={
            <Button href="/mentors" variant="primary-black">
              Find a Mentor
            </Button>
          }
        />
      )}
    </div>
  );
}
