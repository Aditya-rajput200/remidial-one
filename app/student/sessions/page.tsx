"use client";

import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SessionTabs } from "@/components/dashboard/SessionTabs";
import { Button } from "@/components/ui/Button";
import { SkeletonSessionList } from "@/components/dashboard/DashboardSkeletons";

export default function StudentSessionsPage() {
  const { data, updateSessionStatus, rescheduleSession } = useStudentData();

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Sessions" description="All your 1-to-1 sessions, upcoming and past." />
        <SkeletonSessionList count={3} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sessions"
        description="All your 1-to-1 sessions, upcoming and past."
        action={
          <Button href="/student/mentors" variant="primary-black" size="sm">
            Book a Session
          </Button>
        }
      />
      <SessionTabs
        sessions={data.sessions}
        onReschedule={rescheduleSession}
        onCancel={(id) => updateSessionStatus(id, "cancelled")}
        emptyAction={
          <Button href="/student/mentors" variant="primary-black">
            Find a Mentor
          </Button>
        }
      />
    </div>
  );
}
