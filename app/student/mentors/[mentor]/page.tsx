"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import { UserRound, MessageSquare, CalendarPlus } from "lucide-react";
import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonDetailHeader, SkeletonSessionList } from "@/components/dashboard/DashboardSkeletons";

type MentorDetail = {
  id: string;
  name: string;
  bio: string;
  qualifications: string;
  teachingStyle: string;
  subjects: { slug: string; name: string }[];
  grades: { slug: string; name: string }[];
  yearsExperience: number | null;
};

export default function StudentMentorDetailPage(props: PageProps<"/student/mentors/[mentor]">) {
  const { mentor: mentorId } = use(props.params);
  const { data, updateSessionStatus, rescheduleSession } = useStudentData();
  const [mentor, setMentor] = useState<MentorDetail | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/mentors/${mentorId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!cancelled) setMentor(body?.mentor ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [mentorId]);

  if (mentor === null) notFound();
  if (!data || mentor === undefined) {
    return (
      <div className="flex flex-col gap-8">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <SkeletonDetailHeader />
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ink">Session history</h2>
          <SkeletonSessionList count={2} />
        </div>
      </div>
    );
  }

  const history = data.sessions.filter((s) => s.counterpartId === mentorId);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={mentor.name}
        description={mentor.subjects.map((s) => s.name).join(", ") || "Mentor"}
        action={
          <div className="flex gap-2">
            <Button href="/student/messages" variant="secondary-outline" size="sm" className="gap-1.5">
              <MessageSquare className="h-4 w-4" aria-hidden />
              Message
            </Button>
            <Button href={`/book/${mentorId}`} variant="primary-lime" size="sm" className="gap-1.5">
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
          <div className="flex flex-wrap gap-1.5">
            {mentor.grades.map((g) => (
              <Badge key={g.slug} tone="outline">
                {g.name}
              </Badge>
            ))}
          </div>
          {mentor.bio ? <p className="text-sm leading-relaxed text-muted">{mentor.bio}</p> : null}
          {mentor.qualifications ? (
            <p className="text-xs text-muted-2">{mentor.qualifications}</p>
          ) : null}
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
              <Button href={`/book/${mentorId}`} variant="primary-black">
                Book a Session
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
