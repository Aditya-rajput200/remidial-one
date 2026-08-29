"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCardGrid } from "@/components/dashboard/DashboardSkeletons";

type MentorSummary = {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string;
  yearsExperience: number | null;
  subjects: { slug: string; name: string }[];
  grades: { slug: string; name: string }[];
};

export default function FindMentorsPage() {
  const [subjects, setSubjects] = useState<{ slug: string; name: string }[]>([]);
  const [grades, setGrades] = useState<{ slug: string; name: string }[]>([]);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [mentors, setMentors] = useState<MentorSummary[] | null>(null);

  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((body) => setSubjects(body.subjects));
    fetch("/api/grades")
      .then((res) => res.json())
      .then((body) => setGrades(body.grades));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (subjectFilter) params.set("subject", subjectFilter);
    if (gradeFilter) params.set("grade", gradeFilter);

    let cancelled = false;
    fetch(`/api/mentors?${params.toString()}`)
      .then((res) => res.json())
      .then((body) => {
        if (!cancelled) setMentors(body.mentors);
      });
    return () => {
      cancelled = true;
    };
  }, [subjectFilter, gradeFilter]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Find a Mentor" description="Browse mentors by subject and class level." />

      <div className="flex flex-wrap gap-3">
        <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="max-w-xs">
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="max-w-xs">
          <option value="">All classes</option>
          {grades.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name}
            </option>
          ))}
        </Select>
      </div>

      {mentors === null ? (
        <SkeletonCardGrid count={6} />
      ) : mentors.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <Card key={mentor.id} interactive className="flex flex-col gap-4">
              <Avatar src={mentor.avatarUrl} alt={mentor.name} size="md" className="border-0" />
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-ink">{mentor.name}</h3>
                <p className="text-sm text-muted">{mentor.subjects.map((s) => s.name).join(", ")}</p>
                {mentor.bio ? <p className="line-clamp-2 text-xs text-muted-2">{mentor.bio}</p> : null}
              </div>
              <div className="flex gap-2">
                <Button href={`/student/mentors/${mentor.id}`} size="sm" variant="secondary-outline">
                  View Profile
                </Button>
                <Button href={`/book/${mentor.id}`} size="sm" variant="primary-lime">
                  Book
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No mentors available yet"
          description="We're onboarding mentors for this subject and class level — check back soon."
        />
      )}
    </div>
  );
}
