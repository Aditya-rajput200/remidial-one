"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type Subject = { id: string; name: string };

export default function NewAssessmentPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [gradeLabel, setGradeLabel] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [attemptLimit, setAttemptLimit] = useState(1);
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/subjects");
      if (!res.ok) return;
      const body = await res.json();
      setSubjects((body.subjects ?? []).map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })));
    })();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || durationMinutes < 1) {
      setError("Give the assessment a title and a valid duration.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId || undefined,
        gradeLabel: gradeLabel.trim() || undefined,
        durationMinutes,
        attemptLimit,
        negativeMarkingEnabled,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not create assessment.");
      return;
    }
    const body = await res.json();
    router.push(`/mentor/assessments/${body.assessment.id}/builder`);
  }

  return (
    <div>
      <PageHeader title="Create New Assessment" description="Start with the basics — you'll add modules and questions next." />
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FormField label="Test Name" htmlFor="a-title">
            <Input id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Algebra Unit Test" required />
          </FormField>
          <FormField label="Description" htmlFor="a-description" hint="Optional — shown to students on the instructions screen">
            <Textarea id="a-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Subject" htmlFor="a-subject">
              <Select id="a-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">No subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Grade / Class" htmlFor="a-grade">
              <Input id="a-grade" value={gradeLabel} onChange={(e) => setGradeLabel(e.target.value)} placeholder="e.g. Class 9" />
            </FormField>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Duration (minutes)" htmlFor="a-duration">
              <Input
                id="a-duration"
                type="number"
                min={1}
                max={600}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
              />
            </FormField>
            <FormField label="Attempt Limit" htmlFor="a-attempts">
              <Input
                id="a-attempts"
                type="number"
                min={1}
                max={10}
                value={attemptLimit}
                onChange={(e) => setAttemptLimit(Number(e.target.value))}
              />
            </FormField>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={negativeMarkingEnabled}
              onChange={(e) => setNegativeMarkingEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Enable negative marking
          </label>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary-lime" disabled={submitting}>
              {submitting ? "Creating…" : "Create & Continue to Builder"}
            </Button>
            {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
