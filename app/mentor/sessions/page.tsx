"use client";

import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SessionTabs } from "@/components/dashboard/SessionTabs";
import { SkeletonSessionList } from "@/components/dashboard/DashboardSkeletons";

export default function MentorSessionsPage() {
  const { data, updateSessionStatus, rescheduleSession } = useMentorData();

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Sessions" description="All sessions with your students, upcoming and past." />
        <SkeletonSessionList count={3} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Sessions" description="All sessions with your students, upcoming and past." />
      <SessionTabs
        sessions={data.sessions}
        onReschedule={rescheduleSession}
        onCancel={(id) => updateSessionStatus(id, "cancelled")}
        onMarkComplete={(id) => updateSessionStatus(id, "completed")}
      />
    </div>
  );
}
