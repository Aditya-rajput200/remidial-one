"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import {
  QuestionEditorForm,
  defaultDraft,
  QUESTION_TYPES,
  TYPE_LABELS,
  type QuestionDraft,
  type QuestionType,
} from "@/components/assessment/QuestionEditorForm";

type BankQuestion = {
  id: string;
  type: string;
  text: string;
  difficulty: string;
  status: string;
  source: string;
  defaultMarks: string;
};

type Tab = "bank" | "create" | "ai";

export function AddQuestionPanel({ onAdd, onClose }: { onAdd: (questionId: string, marks: number) => Promise<void>; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("bank");

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-full bg-surface p-1">
          {(["bank", "create", "ai"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-white text-ink shadow-card" : "text-muted"
              }`}
            >
              {t === "bank" ? "From Bank" : t === "create" ? "Create New" : "Generate with AI"}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {tab === "bank" ? <FromBankTab onAdd={onAdd} /> : null}
      {tab === "create" ? <CreateNewTab onAdd={onAdd} /> : null}
      {tab === "ai" ? <GenerateAiTab onDone={() => setTab("bank")} /> : null}
    </div>
  );
}

function FromBankTab({ onAdd }: { onAdd: (questionId: string, marks: number) => Promise<void> }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState<BankQuestion[] | null>(null);
  const [marksById, setMarksById] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    (async () => {
      const res = await fetch(`/api/questions?${params}`);
      if (cancelled || !res.ok) return;
      const body = await res.json();
      setResults(body.questions as BankQuestion[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [q, type]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search question bank…" className="pl-11" />
        </div>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="max-w-56">
          <option value="">All types</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t as QuestionType]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex max-h-96 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border">
        {results === null ? (
          <p className="p-4 text-sm text-muted">Loading…</p>
        ) : results.length === 0 ? (
          <p className="p-4 text-sm text-muted">No questions found. Try a different search or create a new one.</p>
        ) : (
          results.map((question) => (
            <div key={question.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{question.text}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="outline">{TYPE_LABELS[question.type as QuestionType] ?? question.type}</Badge>
                  <span className="text-xs text-muted">{question.difficulty}</span>
                  {question.source === "AI_GENERATED" ? <Badge tone="outline-lime">AI Draft</Badge> : null}
                </div>
              </div>
              <Input
                type="number"
                min={0}
                className="w-20"
                value={marksById[question.id] ?? Number(question.defaultMarks)}
                onChange={(e) => setMarksById((prev) => ({ ...prev, [question.id]: Number(e.target.value) }))}
              />
              {question.status !== "APPROVED" ? (
                <Button
                  size="sm"
                  variant="secondary-outline"
                  disabled={addingId === question.id}
                  onClick={async () => {
                    setAddingId(question.id);
                    await fetch(`/api/questions/${question.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "APPROVED" }),
                    });
                    setResults((prev) => prev && prev.map((r) => (r.id === question.id ? { ...r, status: "APPROVED" } : r)));
                    setAddingId(null);
                  }}
                >
                  Approve
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary-black"
                  disabled={addingId === question.id}
                  onClick={async () => {
                    setAddingId(question.id);
                    await onAdd(question.id, marksById[question.id] ?? Number(question.defaultMarks));
                    setAddingId(null);
                  }}
                >
                  {addingId === question.id ? "Adding…" : "Add"}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CreateNewTab({ onAdd }: { onAdd: (questionId: string, marks: number) => Promise<void> }) {
  const [draft, setDraft] = useState<QuestionDraft>(defaultDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
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
    const body = await res.json();
    await onAdd(body.question.id, draft.defaultMarks);
    setDraft(defaultDraft());
  }

  return (
    <div className="flex flex-col gap-4">
      <QuestionEditorForm draft={draft} onChange={setDraft} />
      <div className="flex items-center gap-3">
        <Button variant="primary-lime" onClick={handleCreate} disabled={saving} className="gap-1.5">
          <Plus className="h-4 w-4" /> {saving ? "Creating…" : "Create & Add to Module"}
        </Button>
        {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
      </div>
    </div>
  );
}

const TYPE_KEYS: QuestionType[] = [...QUESTION_TYPES];

function GenerateAiTab({ onDone }: { onDone: () => void }) {
  const [topicHint, setTopicHint] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [cognitiveLevel, setCognitiveLevel] = useState("UNDERSTAND");
  const [counts, setCounts] = useState<Record<string, number>>({ MCQ: 5 });
  const [status, setStatus] = useState<{ state: "idle" | "loading" | "done" | "error"; message?: string }>({ state: "idle" });

  async function handleGenerate() {
    setStatus({ state: "loading" });
    const res = await fetch("/api/ai/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicHint, difficulty, cognitiveLevel, skills: [], typeCounts: counts }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus({ state: "error", message: body?.error ?? "Generation failed." });
      return;
    }
    setStatus({ state: "done", message: `Generated ${body.created} draft question(s) (${body.rejected} rejected). Review them in "From Bank".` });
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Topic" htmlFor="ai-topic" hint="e.g. Linear equations in two variables">
        <Input id="ai-topic" value={topicHint} onChange={(e) => setTopicHint(e.target.value)} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Difficulty" htmlFor="ai-difficulty">
          <Select id="ai-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {["EASY", "MEDIUM", "HARD", "VERY_HARD"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Cognitive Level" htmlFor="ai-cognitive">
          <Select id="ai-cognitive" value={cognitiveLevel} onChange={(e) => setCognitiveLevel(e.target.value)}>
            {["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField label="Question Types & Counts" htmlFor="ai-counts">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TYPE_KEYS.map((t) => (
            <div key={t} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
              <span className="text-xs text-ink">{TYPE_LABELS[t]}</span>
              <Input
                type="number"
                min={0}
                max={20}
                className="h-8 w-14 px-2 text-center"
                value={counts[t] ?? 0}
                onChange={(e) => setCounts((prev) => ({ ...prev, [t]: Number(e.target.value) }))}
              />
            </div>
          ))}
        </div>
      </FormField>

      <div className="flex items-center gap-3">
        <Button variant="primary-lime" className="gap-1.5" onClick={handleGenerate} disabled={status.state === "loading"}>
          <Sparkles className="h-4 w-4" /> {status.state === "loading" ? "Generating…" : "Generate with AI"}
        </Button>
        {status.message ? (
          <p className={`text-xs font-medium ${status.state === "error" ? "text-error" : "text-muted"}`}>{status.message}</p>
        ) : null}
        {status.state === "done" ? (
          <Button variant="secondary-outline" size="sm" onClick={onDone}>
            Review Drafts
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-2">
        AI-generated questions are saved as drafts — review, edit, and approve them in &quot;From Bank&quot; before they can be added to a live test.
      </p>
    </div>
  );
}
