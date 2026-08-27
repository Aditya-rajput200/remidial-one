"use client";

import { use } from "react";
import { UserRound, MessageSquare } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonSessionList } from "@/components/dashboard/DashboardSkeletons";

export default function MentorStudentDetailPage(props: PageProps<"/mentor/students/[student]">) {
  const { student: studentId } = use(props.params);
  const { data, updateSessionStatus, rescheduleSession } = useMentorData();

  if (!data) {
    return (
      <div className="flex flex-col gap-8">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ink">Session history</h2>
          <SkeletonSessionList count={2} />
        </div>
      </div>
    );
  }

  const history = data.sessions.filter((s) => s.counterpartId === studentId);
  const studentName = history[0]?.counterpartName ?? "Student";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={studentName}
        action={
          <Button href="/mentor/messages" variant="secondary-outline" size="sm" className="gap-1.5">
            <MessageSquare className="h-4 w-4" aria-hidden />
            Message
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">Session history</h2>
        {history.length > 0 ? (
          <div className="flex flex-col gap-4">
            {history.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onReschedule={rescheduleSession}
                onCancel={(id) => updateSessionStatus(id, "cancelled")}
                onMarkComplete={(id) => updateSessionStatus(id, "completed")}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={UserRound} title="No sessions yet" description="No sessions recorded with this student yet." />
        )}
      </div>
    </div>
  );
}
