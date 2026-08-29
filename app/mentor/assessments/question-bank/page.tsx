"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Plus, Copy, Archive, Library } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  QuestionEditorForm,
  defaultDraft,
  QUESTION_TYPES,
  TYPE_LABELS,
  type QuestionDraft,
  type QuestionType,
} from "@/components/assessment/QuestionEditorForm";
import { STATUS_TONE, STATUS_LABEL } from "@/components/assessment/status";

type BankQuestion = {
  id: string;
  type: string;
  text: string;
  difficulty: string;
  status: string;
  source: string;
  usageCount: number;
  defaultMarks: string;
};

export default function QuestionBankPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<BankQuestion[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const refetch = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    const res = await fetch(`/api/questions?${params}`);
    if (!res.ok) return;
    const body = await res.json();
    setResults(body.questions as BankQuestion[]);
  }, [q, type, status]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await refetch();
    })();
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  async function approve(id: string) {
    await fetch(`/api/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    await refetch();
  }

  async function archive(id: string) {
    if (!window.confirm("Archive this question? It will no longer appear in search but stays linked to any test that already uses it.")) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    await refetch();
  }

  async function duplicate(id: string) {
    await fetch(`/api/questions/${id}/duplicate`, { method: "POST" });
    await refetch();
  }

  return (
    <div>
      <PageHeader
        title="Question Bank"
        description="Reusable questions you can add to any assessment."
        action={
          <Button variant="primary-lime" className="gap-1.5" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="h-4 w-4" /> New Question
          </Button>
        }
      />

      {showCreate ? (
        <Card className="mb-6">
          <CreateQuestionForm
            onCreated={async () => {
              setShowCreate(false);
              await refetch();
            }}
          />
        </Card>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions…" className="pl-11" />
        </div>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="max-w-56">
          <option value="">All types</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t as QuestionType]}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-48">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="APPROVED">Approved</option>
        </Select>
      </div>

      {results === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : results.length === 0 ? (
        <EmptyState icon={Library} title="No questions yet" description="Create your first question or generate a batch with AI." />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
          {results.map((question) => (
            <div key={question.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{question.text}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge tone="outline">{TYPE_LABELS[question.type as QuestionType] ?? question.type}</Badge>
                  <Badge tone={STATUS_TONE[question.status] ?? "outline"}>{STATUS_LABEL[question.status] ?? question.status}</Badge>
                  {question.source === "AI_GENERATED" ? <Badge tone="outline-lime">AI</Badge> : null}
                  <span className="text-xs text-muted">{question.difficulty} · used in {question.usageCount} test(s)</span>
                </div>
              </div>
              {question.status !== "APPROVED" ? (
                <Button size="sm" variant="secondary-outline" onClick={() => approve(question.id)}>
                  Approve
                </Button>
              ) : null}
              <button onClick={() => duplicate(question.id)} className="text-muted hover:text-ink" aria-label="Duplicate">
                <Copy className="h-4 w-4" />
              </button>
              <button onClick={() => archive(question.id)} className="text-muted hover:text-error" aria-label="Archive">
                <Archive className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateQuestionForm({ onCreated }: { onCreated: () => void }) {
  const [draft, setDraft] = useState<QuestionDraft>(defaultDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!draft.text.trim()) {
      setError("Add question text.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not create question.");
      return;
    }
    setDraft(defaultDraft());
    onCreated();
  }

  return (
    <div className="flex flex-col gap-4">
      <QuestionEditorForm draft={draft} onChange={setDraft} />
      <div className="flex items-center gap-3">
        <Button variant="primary-lime" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : "Save Question"}
        </Button>
        {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
      </div>
    </div>
  );
}
