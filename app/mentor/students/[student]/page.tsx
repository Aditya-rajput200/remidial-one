"use client";

import { notFound } from "next/navigation";
import { UserRound, MessageSquare } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEMO_STUDENT } from "@/lib/data/types";
import { use } from "react";

export default function MentorStudentDetailPage(props: PageProps<"/mentor/students/[student]">) {
  const { student } = use(props.params);
  const { data, updateSessionStatus, rescheduleSession } = useMentorData();

  if (student !== DEMO_STUDENT.id) notFound();
  if (!data) return null;

  const history = data.sessions.filter((s) => s.counterpartId === student);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={DEMO_STUDENT.name}
        description={DEMO_STUDENT.grade}
        action={
          <Button href="/mentor/messages" variant="secondary-outline" size="sm" className="gap-1.5">
            <MessageSquare className="h-4 w-4" aria-hidden />
            Message
          </Button>
        }
      />

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-muted-2">
          <UserRound className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="flex flex-col gap-2">
          <Badge tone="outline">Demo profile</Badge>
          <p className="text-sm leading-relaxed text-muted">
            This is a demo student used to preview the mentor experience — session history and
            messaging work against this sample profile.
          </p>
        </div>
      </div>

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
