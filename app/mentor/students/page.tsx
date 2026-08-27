"use client";

import { UserRound, UsersRound } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEMO_STUDENT } from "@/lib/data/types";

export default function MentorStudentsPage() {
  const { data } = useMentorData();

  if (!data) return null;

  const hasStudent = data.sessions.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Students" description="Students you're currently mentoring." />

      {hasStudent ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card interactive className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted-2">
                <UserRound className="h-7 w-7" strokeWidth={1.5} aria-hidden />
              </div>
              <Badge tone="outline">Demo</Badge>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">{DEMO_STUDENT.name}</h3>
              <p className="text-sm text-muted">{DEMO_STUDENT.grade}</p>
            </div>
            <div className="flex gap-2">
              <Button href={`/mentor/students/${DEMO_STUDENT.id}`} size="sm" variant="secondary-outline">
                View Details
              </Button>
              <Button href="/mentor/messages" size="sm" variant="ghost">
                Message
              </Button>
            </div>
          </Card>
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
