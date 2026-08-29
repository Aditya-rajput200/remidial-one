"use client";

import { FolderOpen, FileText, ClipboardList, PlayCircle } from "lucide-react";
import { useStudentData } from "@/lib/data/useStudentData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Resource } from "@/lib/data/types";
import { SkeletonList } from "@/components/dashboard/DashboardSkeletons";
import { NotesPanel } from "@/components/dashboard/NotesPanel";
import { ClassNotesPanel } from "@/components/dashboard/ClassNotesPanel";

const typeIcon: Record<Resource["type"], typeof FileText> = {
  video: PlayCircle,
  note: FileText,
  assignment: ClipboardList,
};

export default function StudentResourcesPage() {
  const { data } = useStudentData();

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Resources" description="Notes, assignments, and materials shared by your mentor." />
        <SkeletonList rows={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Resources" description="Notes, assignments, and materials shared by your mentor." />

      <NotesPanel />

      <ClassNotesPanel />

      <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-muted">Other Materials</h2>

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
        <EmptyState
          icon={FolderOpen}
          title="No resources yet"
          description="Materials your mentor shares after sessions will appear here."
        />
      )}
    </div>
  );
}
