"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function MentorProfilePage() {
  const { data, updateProfile } = useMentorData();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [languages, setLanguages] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("");

  useEffect(() => {
    // Populates editable form state once async-loaded profile data arrives.
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBio(data.profile.bio);
      setQualifications(data.profile.qualifications);
      setLanguages(data.profile.languages);
      setTeachingStyle(data.profile.teachingStyle);
    }
  }, [data]);

  if (!data) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const ok = await updateProfile({ ...data!.profile, bio, qualifications, languages, teachingStyle });
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
        <FormField label="Name" htmlFor="mp-name">
          <Input id="mp-name" value={data.profile.name} disabled />
        </FormField>
        <FormField label="Email" htmlFor="mp-email">
          <Input id="mp-email" value={data.profile.email} disabled />
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
          {error ? <span className="text-sm font-medium text-error">{error}</span> : null}
        </div>
      </form>
    </div>
  );
}
