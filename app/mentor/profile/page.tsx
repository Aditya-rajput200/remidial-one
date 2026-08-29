"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AvatarUploader } from "@/components/dashboard/AvatarUploader";
import { SkeletonForm } from "@/components/dashboard/DashboardSkeletons";
import { cn } from "@/lib/cn";

type Option = { slug: string; name: string };

function ChipToggle({
  options,
  selected,
  onToggle,
}: {
  options: Option[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = selected.includes(option.slug);
        return (
          <button
            key={option.slug}
            type="button"
            onClick={() => onToggle(option.slug)}
            aria-pressed={isActive}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
              isActive ? "border-ink bg-ink text-white" : "border-border text-muted hover:border-ink/40"
            )}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}

export default function MentorProfilePage() {
  const { data, updateProfile } = useMentorData();
  const [subjectOptions, setSubjectOptions] = useState<Option[]>([]);
  const [gradeOptions, setGradeOptions] = useState<Option[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [languages, setLanguages] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("");
  const [subjectSlugs, setSubjectSlugs] = useState<string[]>([]);
  const [gradeSlugs, setGradeSlugs] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((body) => setSubjectOptions(body.subjects));
    fetch("/api/grades")
      .then((res) => res.json())
      .then((body) => setGradeOptions(body.grades));
  }, []);

  useEffect(() => {
    // Populates editable form state once async-loaded profile data arrives.
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBio(data.profile.bio);
      setQualifications(data.profile.qualifications);
      setLanguages(data.profile.languages);
      setTeachingStyle(data.profile.teachingStyle);
      setSubjectSlugs(data.profile.subjects.map((s) => s.slug));
      setGradeSlugs(data.profile.grades.map((g) => g.slug));
      setAvatarUrl(data.profile.avatarUrl);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Profile" description="This is how your profile will appear to students once mentor profiles go live." />
        <SkeletonForm fields={6} />
      </div>
    );
  }

  function toggleSubject(slug: string) {
    setSubjectSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  function toggleGrade(slug: string) {
    setGradeSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (subjectSlugs.length === 0) {
      setError("Select at least one subject you teach so students can book you.");
      return;
    }
    if (gradeSlugs.length === 0) {
      setError("Select at least one class level you teach.");
      return;
    }
    setSaving(true);
    setError("");
    const ok = await updateProfile({
      ...data!.profile,
      bio,
      qualifications,
      languages,
      teachingStyle,
      subjects: subjectOptions.filter((s) => subjectSlugs.includes(s.slug)),
      grades: gradeOptions.filter((g) => gradeSlugs.includes(g.slug)),
    });
    setSaving(false);
    if (!ok) {
      setError("Could not save your changes. Please try again.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" description="This is how your profile will appear to students once mentor profiles go live." />

      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5 rounded-2xl border border-border bg-white p-6">
        <AvatarUploader avatarUrl={avatarUrl} name={data.profile.name} onChange={setAvatarUrl} />
        <FormField label="Name" htmlFor="mp-name">
          <Input id="mp-name" value={data.profile.name} disabled />
        </FormField>
        <FormField label="Email" htmlFor="mp-email">
          <Input id="mp-email" value={data.profile.email} disabled />
        </FormField>
        <FormField label="Subjects you teach" htmlFor="mp-subjects" hint="Students can only book you for subjects you select here.">
          <ChipToggle options={subjectOptions} selected={subjectSlugs} onToggle={toggleSubject} />
        </FormField>
        <FormField label="Class levels you teach" htmlFor="mp-grades">
          <ChipToggle options={gradeOptions} selected={gradeSlugs} onToggle={toggleGrade} />
        </FormField>
        <FormField label="Bio" htmlFor="mp-bio">
          <Textarea id="mp-bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        </FormField>
        <FormField label="Qualifications" htmlFor="mp-qual">
          <Input id="mp-qual" value={qualifications} onChange={(e) => setQualifications(e.target.value)} />
        </FormField>
        <FormField label="Languages" htmlFor="mp-lang">
          <Input id="mp-lang" value={languages} onChange={(e) => setLanguages(e.target.value)} />
        </FormField>
        <FormField label="Teaching style" htmlFor="mp-style">
          <Textarea id="mp-style" value={teachingStyle} onChange={(e) => setTeachingStyle(e.target.value)} />
        </FormField>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" variant="primary-lime" size="md" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-lime-ink">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Saved
            </span>
          ) : null}
          {error ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-error">
              <AlertCircle className="h-4 w-4" aria-hidden />
              {error}
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
