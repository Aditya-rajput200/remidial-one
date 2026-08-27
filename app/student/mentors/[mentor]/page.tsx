"use client";

import { notFound } from "next/navigation";
import { UserRound, MessageSquare, CalendarPlus } from "lucide-react";
import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEMO_MENTOR } from "@/lib/data/types";
import { use } from "react";

export default function StudentMentorDetailPage(props: PageProps<"/student/mentors/[mentor]">) {
  const { mentor } = use(props.params);
  const { data, updateSessionStatus, rescheduleSession } = useStudentData();

  if (mentor !== DEMO_MENTOR.id) notFound();
  if (!data) return null;

  const history = data.sessions.filter((s) => s.counterpartId === mentor);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={DEMO_MENTOR.name}
        description={DEMO_MENTOR.role}
        action={
          <div className="flex gap-2">
            <Button href="/student/messages" variant="secondary-outline" size="sm" className="gap-1.5">
              <MessageSquare className="h-4 w-4" aria-hidden />
              Message
            </Button>
            <Button href={`/book/${DEMO_MENTOR.id}`} variant="primary-lime" size="sm" className="gap-1.5">
              <CalendarPlus className="h-4 w-4" aria-hidden />
              Book a Session
            </Button>
          </div>
        }
      />

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-muted-2">
          <UserRound className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="flex flex-col gap-2">
          <Badge tone="outline">Demo profile</Badge>
          <p className="text-sm leading-relaxed text-muted">
            This is a demo mentor used to preview the platform experience — booking, messaging, and
            session history all work against this sample profile.
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
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UserRound}
            title="No sessions yet"
            description="Book your first session with this mentor to get started."
            action={
              <Button href={`/book/${DEMO_MENTOR.id}`} variant="primary-black">
                Book a Session
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
