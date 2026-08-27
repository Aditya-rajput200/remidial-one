"use client";

import { useState, type FormEvent } from "react";
import { FolderOpen, FileText, ClipboardList, PlayCircle, Plus } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import type { Resource } from "@/lib/data/types";
import { SkeletonList } from "@/components/dashboard/DashboardSkeletons";

const typeIcon: Record<Resource["type"], typeof FileText> = {
  video: PlayCircle,
  note: FileText,
  assignment: ClipboardList,
};

export default function MentorResourcesPage() {
  const { data, addResource } = useMentorData();
  const [showForm, setShowForm] = useState(false);

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Resources" description="Notes, assignments, and materials you've shared with students." />
        <SkeletonList rows={4} />
      </div>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const subjectName = String(formData.get("subjectName") ?? "").trim();
    const type = String(formData.get("type") ?? "note") as Resource["type"];
    if (!title || !subjectName) return;

    addResource({
      id: `mr-${Date.now()}`,
      title,
      type,
      subjectName,
      addedAt: new Date().toISOString(),
    });
    setShowForm(false);
    event.currentTarget.reset();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resources"
        description="Notes, assignments, and materials you've shared with students."
        action={
          <Button size="sm" variant="primary-black" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Resource
          </Button>
        }
      />

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-2xl border border-border bg-white p-6 sm:grid-cols-3"
        >
          <FormField label="Title" htmlFor="res-title">
            <Input id="res-title" name="title" placeholder="e.g. Practice worksheet" required />
          </FormField>
          <FormField label="Subject" htmlFor="res-subject">
            <Input id="res-subject" name="subjectName" placeholder="e.g. Mathematics" required />
          </FormField>
          <FormField label="Type" htmlFor="res-type">
            <Select id="res-type" name="type" defaultValue="note">
              <option value="note">Note</option>
              <option value="assignment">Assignment</option>
              <option value="video">Video</option>
            </Select>
          </FormField>
          <div className="sm:col-span-3">
            <Button type="submit" variant="primary-lime" size="sm">
              Save Resource
            </Button>
          </div>
        </form>
      ) : null}

      {data.resources.length > 0 ? (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
          {data.resources.map((resource) => {
            const Icon = typeIcon[resource.type];
            return (
              <div key={resource.id} className="flex items-center gap-4 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-soft text-ink">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{resource.title}</p>
                  <p className="text-xs text-muted">
                    {resource.subjectName} · {resource.type}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={FolderOpen} title="No resources yet" description="Add notes, assignments, or videos for your students." />
      )}
    </div>
  );
}
