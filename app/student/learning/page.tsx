"use client";

import { BookOpen } from "lucide-react";
import { useStudentData } from "@/lib/data/useStudentData";
import { getSubjectBySlug } from "@/lib/content/subjects";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StudentLearningPage() {
  const { data } = useStudentData();

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="My Learning" description="Subjects you're actively learning through 1-to-1 sessions." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const subjects = data.profile.subjectsOfInterest
    .map((slug) => ({ slug, subject: getSubjectBySlug(slug) }))
    .filter((entry): entry is { slug: string; subject: NonNullable<ReturnType<typeof getSubjectBySlug>> } =>
      Boolean(entry.subject)
    );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Learning" description="Subjects you're actively learning through 1-to-1 sessions." />

      {subjects.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map(({ subject }) => {
            const progress = data.progress.find((p) => p.subjectSlug === subject.slug);
            return (
              <div key={subject.slug} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
                <h3 className="text-lg font-semibold text-ink">{subject.name}</h3>
                <p className="text-sm leading-relaxed text-muted">{subject.shortDescription}</p>
                {progress ? <ProgressBar value={progress.sessionsCompleted} max={10} label="Sessions" /> : null}
                <Button href={`/subjects/${subject.slug}`} variant="ghost" size="sm" className="w-fit">
                  View subject overview
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No active subjects yet"
          description="Once you book a session, the subject will appear here with your progress."
          action={
            <Button href="/subjects" variant="primary-black">
              Browse Subjects
            </Button>
          }
        />
      )}
    </div>
  );
}
