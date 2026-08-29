"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { AvatarUploader } from "@/components/dashboard/AvatarUploader";
import { classBands } from "@/lib/content/classes";
import { SkeletonForm } from "@/components/dashboard/DashboardSkeletons";

export default function StudentProfilePage() {
  const { data, updateProfile } = useStudentData();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [grade, setGrade] = useState("");
  const [goals, setGoals] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // Populates editable form state once async-loaded profile data arrives.
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGrade(data.profile.grade);
      setGoals(data.profile.learningGoals);
      setPreferredTime(data.profile.preferredTime);
      setAvatarUrl(data.profile.avatarUrl);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Profile" description="Keep your learning preferences up to date." />
        <SkeletonForm fields={4} />
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const ok = await updateProfile({ ...data!.profile, grade, learningGoals: goals, preferredTime });
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
      <PageHeader title="Profile" description="Keep your learning preferences up to date." />

      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5 rounded-2xl border border-border bg-white p-6">
        <AvatarUploader avatarUrl={avatarUrl} name={data.profile.name} onChange={setAvatarUrl} />
        <FormField label="Name" htmlFor="profile-name">
          <Input id="profile-name" value={data.profile.name} disabled />
        </FormField>
        <FormField label="Email" htmlFor="profile-email">
          <Input id="profile-email" value={data.profile.email} disabled />
        </FormField>
        <FormField label="Class / Grade" htmlFor="profile-grade">
          <Select id="profile-grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
            {classBands.map((band) => (
              <option key={band.slug} value={band.name}>
                {band.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Learning goals" htmlFor="profile-goals">
          <Textarea id="profile-goals" value={goals} onChange={(e) => setGoals(e.target.value)} />
        </FormField>
        <FormField label="Preferred session time" htmlFor="profile-time">
          <Input id="profile-time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} />
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
          {error ? <span className="text-sm font-medium text-error">{error}</span> : null}
        </div>
      </form>
    </div>
  );
}
