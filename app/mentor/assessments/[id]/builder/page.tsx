"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Users, Rocket, Pause, Play, Square, Archive } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AddQuestionPanel } from "@/components/assessment/AddQuestionPanel";
import { TYPE_LABELS, type QuestionType } from "@/components/assessment/QuestionEditorForm";
import { STATUS_LABEL, STATUS_TONE } from "@/components/assessment/status";
import { AssignStudentsPanel } from "@/components/assessment/AssignStudentsPanel";

type ModuleQuestion = {
  id: string;
  order: number;
  marks: string;
  negativeMarks: string;
  question: { id: string; type: string; text: string; difficulty: string };
};

type ModuleData = { id: string; name: string; order: number; questions: ModuleQuestion[] };

type AssessmentData = {
  id: string;
  title: string;
  status: string;
  durationMinutes: number;
  totalMarks: string;
  modules: ModuleData[];
  assignments: { student: { id: string; user: { name: string } } }[];
};

async function fetchAssessment(id: string): Promise<AssessmentData | null> {
  const res = await fetch(`/api/assessments/${id}`);
  if (!res.ok) return null;
  const body = await res.json();
  return body.assessment as AssessmentData;
}

export default function AssessmentBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [actionError, setActionError] = useState("");

  const refetch = useCallback(async () => {
    const data = await fetchAssessment(id);
    setAssessment(data);
    if (data && !selectedModuleId && data.modules.length > 0) setSelectedModuleId(data.modules[0].id);
  }, [id, selectedModuleId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isEditable = assessment?.status === "DRAFT" || assessment?.status === "REVIEW";
  const selectedModule = assessment?.modules.find((m) => m.id === selectedModuleId) ?? null;

  async function addModule() {
    if (!newModuleName.trim()) return;
    const res = await fetch(`/api/assessments/${id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newModuleName.trim() }),
    });
    if (res.ok) {
      const body = await res.json();
      setNewModuleName("");
      await refetch();
      setSelectedModuleId(body.module.id);
    }
  }

  async function removeModule(moduleId: string) {
    if (!window.confirm("Remove this module and all its questions from the test?")) return;
    await fetch(`/api/assessments/${id}/modules/${moduleId}`, { method: "DELETE" });
    setSelectedModuleId(null);
    await refetch();
  }

  async function handleAddQuestion(questionId: string, marks: number) {
    if (!selectedModuleId) return;
    await fetch(`/api/assessments/${id}/modules/${selectedModuleId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, marks, negativeMarks: 0 }),
    });
    await refetch();
  }

  async function removeQuestion(moduleQuestionId: string) {
    if (!selectedModuleId) return;
    await fetch(`/api/assessments/${id}/modules/${selectedModuleId}/questions/${moduleQuestionId}`, { method: "DELETE" });
    await refetch();
  }

  async function updateMarks(moduleQuestionId: string, marks: number) {
    if (!selectedModuleId) return;
    await fetch(`/api/assessments/${id}/modules/${selectedModuleId}/questions/${moduleQuestionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marks }),
    });
    await refetch();
  }

  async function moveQuestion(index: number, direction: -1 | 1) {
    if (!selectedModule) return;
    const ids = selectedModule.questions.map((q) => q.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await fetch(`/api/assessments/${id}/modules/${selectedModule.id}/questions/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleQuestionIds: ids }),
    });
    await refetch();
  }

  async function runAction(action: string, extra?: Record<string, unknown>) {
    setActionError("");
    const res = await fetch(`/api/assessments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setActionError(body?.error ?? "Action failed.");
      return;
    }
    if (action === "publish") router.push(`/mentor/assessments/${id}/analytics`);
    await refetch();
  }

  if (assessment === null) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div>
      <PageHeader
        title={assessment.title}
        description={`${assessment.durationMinutes} min · ${assessment.totalMarks} marks · ${assessment.assignments.length} students assigned`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONE[assessment.status] ?? "outline"}>{STATUS_LABEL[assessment.status] ?? assessment.status}</Badge>
            <Button size="sm" variant="secondary-outline" className="gap-1.5" onClick={() => setShowAssign(true)}>
              <Users className="h-4 w-4" /> Assign Students
            </Button>
            {isEditable ? (
              <Button size="sm" variant="primary-lime" className="gap-1.5" onClick={() => runAction("publish")}>
                <Rocket className="h-4 w-4" /> Publish
              </Button>
            ) : null}
            {assessment.status === "LIVE" ? (
              <Button size="sm" variant="secondary-outline" className="gap-1.5" onClick={() => runAction("pause")}>
                <Pause className="h-4 w-4" /> Pause
              </Button>
            ) : null}
            {assessment.status === "PAUSED" ? (
              <Button size="sm" variant="secondary-outline" className="gap-1.5" onClick={() => runAction("resume")}>
                <Play className="h-4 w-4" /> Resume
              </Button>
            ) : null}
            {assessment.status === "LIVE" || assessment.status === "PAUSED" ? (
              <Button size="sm" variant="secondary-outline" className="gap-1.5" onClick={() => runAction("end")}>
                <Square className="h-4 w-4" /> End
              </Button>
            ) : null}
            {assessment.status === "RESULT_READY" || assessment.status === "ENDED" ? (
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => runAction("archive")}>
                <Archive className="h-4 w-4" /> Archive
              </Button>
            ) : null}
          </div>
        }
      />
      {actionError ? <p className="mb-4 text-sm font-medium text-error">{actionError}</p> : null}
      {!isEditable ? (
        <p className="mb-6 rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm text-muted">
          This assessment&apos;s structure is locked because it has been published. Duplicate it to make structural changes.
        </p>
      ) : null}

      {showAssign ? (
        <AssignStudentsPanel
          assessmentId={id}
          assigned={assessment.assignments.map((a) => a.student.id)}
          onClose={() => setShowAssign(false)}
          onChange={refetch}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Card className="h-fit">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Modules</h2>
            <div className="flex flex-col gap-1.5">
              {assessment.modules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModuleId(m.id)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    m.id === selectedModuleId ? "bg-ink text-white" : "text-ink hover:bg-surface"
                  }`}
                >
                  <span className="truncate">{m.name}</span>
                  <span className={`text-xs ${m.id === selectedModuleId ? "text-white/70" : "text-muted"}`}>{m.questions.length}</span>
                </button>
              ))}
            </div>
            {isEditable ? (
              <div className="mt-4 flex gap-2">
                <Input
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder="New module name"
                  className="h-10"
                  onKeyDown={(e) => e.key === "Enter" && addModule()}
                />
                <Button size="sm" variant="secondary-outline" onClick={addModule}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </Card>

          <div className="flex flex-col gap-4">
            {!selectedModule ? (
              <EmptyState icon={Plus} title="Add a module to get started" description="Modules group questions — e.g. Remember & Recall, Application, Reasoning." />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ink">{selectedModule.name}</h2>
                  {isEditable ? (
                    <Button size="sm" variant="ghost" className="gap-1.5 text-error" onClick={() => removeModule(selectedModule.id)}>
                      <Trash2 className="h-4 w-4" /> Remove Module
                    </Button>
                  ) : null}
                </div>

                {selectedModule.questions.length === 0 ? (
                  <EmptyState icon={Plus} title="No questions in this module" description="Add questions from your bank, create new ones, or generate with AI." />
                ) : (
                  <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
                    {selectedModule.questions.map((mq, i) => (
                      <div key={mq.id} className="flex items-center gap-3 p-4">
                        {isEditable ? (
                          <div className="flex flex-col text-muted">
                            <button onClick={() => moveQuestion(i, -1)} disabled={i === 0} aria-label="Move up">
                              <GripVertical className="h-4 w-4" />
                            </button>
                          </div>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-ink">{mq.question.text}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge tone="outline">{TYPE_LABELS[mq.question.type as QuestionType] ?? mq.question.type}</Badge>
                            <span className="text-xs text-muted">{mq.question.difficulty}</span>
                          </div>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          className="w-20"
                          value={mq.marks}
                          disabled={!isEditable}
                          onChange={(e) => updateMarks(mq.id, Number(e.target.value))}
                        />
                        {isEditable ? (
                          <button onClick={() => removeQuestion(mq.id)} className="text-muted hover:text-error" aria-label="Remove question">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                {isEditable && !showAddQuestion ? (
                  <Button variant="secondary-outline" className="w-fit gap-1.5" onClick={() => setShowAddQuestion(true)}>
                    <Plus className="h-4 w-4" /> Add Question
                  </Button>
                ) : null}
                {isEditable && showAddQuestion ? (
                  <AddQuestionPanel onAdd={handleAddQuestion} onClose={() => setShowAddQuestion(false)} />
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
