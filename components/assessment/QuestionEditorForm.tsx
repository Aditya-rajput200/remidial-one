"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export const QUESTION_TYPES = [
  "MCQ",
  "MULTIPLE_CORRECT",
  "TRUE_FALSE",
  "FILL_BLANK",
  "MATCH_FOLLOWING",
  "SHORT_ANSWER",
  "LONG_ANSWER",
  "IMAGE_ANSWER",
  "NUMERICAL",
  "EQUATION",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: "Multiple Choice",
  MULTIPLE_CORRECT: "Multiple Correct",
  TRUE_FALSE: "True / False",
  FILL_BLANK: "Fill in the Blank",
  MATCH_FOLLOWING: "Match the Following",
  SHORT_ANSWER: "Short Answer",
  LONG_ANSWER: "Long Answer",
  IMAGE_ANSWER: "Image / Handwritten Answer",
  NUMERICAL: "Numerical",
  EQUATION: "Equation",
};

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "VERY_HARD"] as const;
const COGNITIVE_LEVELS = ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"] as const;
const SKILLS = [
  "MEMORY",
  "RECALL",
  "CONCEPTUAL_UNDERSTANDING",
  "READING",
  "WRITING",
  "MENTAL_ABILITY",
  "LOGICAL_REASONING",
  "CRITICAL_THINKING",
  "PROBLEM_SOLVING",
  "ANALYTICAL_THINKING",
  "APPLICATION",
  "CALCULATION",
  "INTERPRETATION",
  "CREATIVITY",
  "COMMUNICATION",
] as const;

type Option = { id: string; text: string };

export type QuestionDraft = {
  type: QuestionType;
  text: string;
  explanation: string;
  hint: string;
  difficulty: (typeof DIFFICULTIES)[number];
  cognitiveLevel: (typeof COGNITIVE_LEVELS)[number];
  skills: string[];
  defaultMarks: number;
  defaultNegativeMarks: number;
  estimatedTimeSeconds: number;
  content: Record<string, unknown>;
};

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function defaultContentFor(type: QuestionType): Record<string, unknown> {
  switch (type) {
    case "MCQ":
      return { options: [{ id: newId(), text: "" }, { id: newId(), text: "" }], correctOptionIds: [] };
    case "MULTIPLE_CORRECT":
      return { options: [{ id: newId(), text: "" }, { id: newId(), text: "" }], correctOptionIds: [] };
    case "TRUE_FALSE":
      return { correctAnswer: true };
    case "FILL_BLANK":
      return { acceptedAnswers: [""], caseSensitive: false };
    case "MATCH_FOLLOWING":
      return {
        left: [{ id: newId(), text: "" }, { id: newId(), text: "" }],
        right: [{ id: newId(), text: "" }, { id: newId(), text: "" }],
        correctPairs: [],
      };
    case "SHORT_ANSWER":
    case "LONG_ANSWER":
      return { expectedAnswer: "", rubric: "" };
    case "IMAGE_ANSWER":
      return { instructions: "" };
    case "NUMERICAL":
      return { correctValue: 0, tolerance: 0, unit: "" };
    case "EQUATION":
      return { correctExpression: "", tolerance: 0 };
  }
}

export function defaultDraft(type: QuestionType = "MCQ"): QuestionDraft {
  return {
    type,
    text: "",
    explanation: "",
    hint: "",
    difficulty: "MEDIUM",
    cognitiveLevel: "UNDERSTAND",
    skills: [],
    defaultMarks: 1,
    defaultNegativeMarks: 0,
    estimatedTimeSeconds: 60,
    content: defaultContentFor(type),
  };
}

export function QuestionEditorForm({ draft, onChange }: { draft: QuestionDraft; onChange: (next: QuestionDraft) => void }) {
  function setContent(patch: Record<string, unknown>) {
    onChange({ ...draft, content: { ...draft.content, ...patch } });
  }

  function changeType(type: QuestionType) {
    onChange({ ...draft, type, content: defaultContentFor(type) });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Question Type" htmlFor="q-type">
          <Select id="q-type" value={draft.type} onChange={(e) => changeType(e.target.value as QuestionType)}>
            {QUESTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Difficulty" htmlFor="q-difficulty">
          <Select
            id="q-difficulty"
            value={draft.difficulty}
            onChange={(e) => onChange({ ...draft, difficulty: e.target.value as QuestionDraft["difficulty"] })}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.replace("_", " ")}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Question Text" htmlFor="q-text">
        <Textarea id="q-text" value={draft.text} onChange={(e) => onChange({ ...draft, text: e.target.value })} rows={3} required />
      </FormField>

      <ContentEditor type={draft.type} content={draft.content} setContent={setContent} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Explanation" htmlFor="q-explanation" hint="Shown to students after results are published">
          <Textarea id="q-explanation" value={draft.explanation} onChange={(e) => onChange({ ...draft, explanation: e.target.value })} rows={2} />
        </FormField>
        <FormField label="Hint" htmlFor="q-hint">
          <Textarea id="q-hint" value={draft.hint} onChange={(e) => onChange({ ...draft, hint: e.target.value })} rows={2} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Cognitive Level" htmlFor="q-cognitive">
          <Select
            id="q-cognitive"
            value={draft.cognitiveLevel}
            onChange={(e) => onChange({ ...draft, cognitiveLevel: e.target.value as QuestionDraft["cognitiveLevel"] })}
          >
            {COGNITIVE_LEVELS.map((c) => (
              <option key={c} value={c}>
                {c[0] + c.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Marks" htmlFor="q-marks">
          <Input
            id="q-marks"
            type="number"
            min={0}
            value={draft.defaultMarks}
            onChange={(e) => onChange({ ...draft, defaultMarks: Number(e.target.value) })}
          />
        </FormField>
        <FormField label="Est. Time (sec)" htmlFor="q-time">
          <Input
            id="q-time"
            type="number"
            min={5}
            value={draft.estimatedTimeSeconds}
            onChange={(e) => onChange({ ...draft, estimatedTimeSeconds: Number(e.target.value) })}
          />
        </FormField>
      </div>

      <FormField label="Skills" htmlFor="q-skills" hint="Select any that apply">
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => {
            const active = draft.skills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() =>
                  onChange({
                    ...draft,
                    skills: active ? draft.skills.filter((s) => s !== skill) : [...draft.skills, skill],
                  })
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "border-ink bg-ink text-white" : "border-border text-muted hover:border-ink/40"
                }`}
              >
                {skill.replace(/_/g, " ").toLowerCase()}
              </button>
            );
          })}
        </div>
      </FormField>
    </div>
  );
}

function ContentEditor({
  type,
  content,
  setContent,
}: {
  type: QuestionType;
  content: Record<string, unknown>;
  setContent: (patch: Record<string, unknown>) => void;
}) {
  if (type === "MCQ" || type === "MULTIPLE_CORRECT") {
    const options = (content.options as Option[]) ?? [];
    const correctIds = (content.correctOptionIds as string[]) ?? [];
    const multi = type === "MULTIPLE_CORRECT";

    function toggleCorrect(id: string) {
      if (multi) {
        setContent({ correctOptionIds: correctIds.includes(id) ? correctIds.filter((c) => c !== id) : [...correctIds, id] });
      } else {
        setContent({ correctOptionIds: [id] });
      }
    }

    return (
      <FormField label="Options" htmlFor="q-options" hint={multi ? "Check all correct options" : "Select the correct option"}>
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2">
              <input
                type={multi ? "checkbox" : "radio"}
                checked={correctIds.includes(opt.id)}
                onChange={() => toggleCorrect(opt.id)}
                className="h-4 w-4 shrink-0"
              />
              <Input
                value={opt.text}
                onChange={(e) => setContent({ options: options.map((o, j) => (j === i ? { ...o, text: e.target.value } : o)) })}
                placeholder={`Option ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => setContent({ options: options.filter((_, j) => j !== i), correctOptionIds: correctIds.filter((c) => c !== opt.id) })}
                className="shrink-0 text-muted hover:text-error"
                aria-label="Remove option"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit gap-1.5"
            onClick={() => setContent({ options: [...options, { id: newId(), text: "" }] })}
          >
            <Plus className="h-4 w-4" /> Add Option
          </Button>
        </div>
      </FormField>
    );
  }

  if (type === "TRUE_FALSE") {
    return (
      <FormField label="Correct Answer" htmlFor="q-tf">
        <div className="flex gap-4">
          {[true, false].map((val) => (
            <label key={String(val)} className="flex items-center gap-2 text-sm text-ink">
              <input type="radio" checked={content.correctAnswer === val} onChange={() => setContent({ correctAnswer: val })} />
              {val ? "True" : "False"}
            </label>
          ))}
        </div>
      </FormField>
    );
  }

  if (type === "FILL_BLANK") {
    const answers = (content.acceptedAnswers as string[]) ?? [""];
    return (
      <FormField label="Accepted Answers" htmlFor="q-fb" hint="Comma-separated — any of these will be marked correct">
        <Input
          id="q-fb"
          value={answers.join(", ")}
          onChange={(e) => setContent({ acceptedAnswers: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
        />
        <label className="mt-2 flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={Boolean(content.caseSensitive)}
            onChange={(e) => setContent({ caseSensitive: e.target.checked })}
          />
          Case sensitive
        </label>
      </FormField>
    );
  }

  if (type === "MATCH_FOLLOWING") {
    const left = (content.left as Option[]) ?? [];
    const right = (content.right as Option[]) ?? [];
    const pairs = (content.correctPairs as { leftId: string; rightId: string }[]) ?? [];

    function updateSide(side: "left" | "right", items: Option[]) {
      setContent({ [side]: items });
    }

    function setPair(leftId: string, rightId: string) {
      setContent({ correctPairs: [...pairs.filter((p) => p.leftId !== leftId), ...(rightId ? [{ leftId, rightId }] : [])] });
    }

    return (
      <FormField label="Match the Following" htmlFor="q-match">
        <div className="flex flex-col gap-2">
          {left.map((item, i) => {
            const pair = pairs.find((p) => p.leftId === item.id);
            return (
              <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  value={item.text}
                  onChange={(e) => updateSide("left", left.map((o, j) => (j === i ? { ...o, text: e.target.value } : o)))}
                  placeholder={`Left ${i + 1}`}
                />
                <Select value={pair?.rightId ?? ""} onChange={(e) => setPair(item.id, e.target.value)}>
                  <option value="">Matches…</option>
                  {right.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.text || "(untitled)"}
                    </option>
                  ))}
                </Select>
                <button type="button" onClick={() => updateSide("left", left.filter((_, j) => j !== i))} className="text-muted hover:text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          <Button type="button" variant="ghost" size="sm" className="w-fit gap-1.5" onClick={() => updateSide("left", [...left, { id: newId(), text: "" }])}>
            <Plus className="h-4 w-4" /> Add Left Item
          </Button>

          <p className="mt-2 text-xs font-medium text-muted">Right-side options</p>
          {right.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input value={item.text} onChange={(e) => updateSide("right", right.map((o, j) => (j === i ? { ...o, text: e.target.value } : o)))} placeholder={`Right ${i + 1}`} />
              <button type="button" onClick={() => updateSide("right", right.filter((_, j) => j !== i))} className="text-muted hover:text-error">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" className="w-fit gap-1.5" onClick={() => updateSide("right", [...right, { id: newId(), text: "" }])}>
            <Plus className="h-4 w-4" /> Add Right Item
          </Button>
        </div>
      </FormField>
    );
  }

  if (type === "SHORT_ANSWER" || type === "LONG_ANSWER") {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Expected Answer" htmlFor="q-expected" hint="Reference for the teacher/AI — not shown to students until published">
          <Textarea id="q-expected" value={String(content.expectedAnswer ?? "")} onChange={(e) => setContent({ expectedAnswer: e.target.value })} rows={3} />
        </FormField>
        <FormField label="Rubric" htmlFor="q-rubric">
          <Textarea id="q-rubric" value={String(content.rubric ?? "")} onChange={(e) => setContent({ rubric: e.target.value })} rows={3} />
        </FormField>
      </div>
    );
  }

  if (type === "IMAGE_ANSWER") {
    return (
      <FormField label="Instructions for the student" htmlFor="q-image-instructions">
        <Textarea id="q-image-instructions" value={String(content.instructions ?? "")} onChange={(e) => setContent({ instructions: e.target.value })} rows={2} />
      </FormField>
    );
  }

  if (type === "NUMERICAL") {
    return (
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Correct Value" htmlFor="q-num-value">
          <Input id="q-num-value" type="number" value={Number(content.correctValue ?? 0)} onChange={(e) => setContent({ correctValue: Number(e.target.value) })} />
        </FormField>
        <FormField label="Tolerance (±)" htmlFor="q-num-tolerance">
          <Input id="q-num-tolerance" type="number" min={0} value={Number(content.tolerance ?? 0)} onChange={(e) => setContent({ tolerance: Number(e.target.value) })} />
        </FormField>
        <FormField label="Unit" htmlFor="q-num-unit">
          <Input id="q-num-unit" value={String(content.unit ?? "")} onChange={(e) => setContent({ unit: e.target.value })} />
        </FormField>
      </div>
    );
  }

  if (type === "EQUATION") {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Correct Expression" htmlFor="q-eq-expr" hint="e.g. x=5 or 3/4">
          <Input id="q-eq-expr" value={String(content.correctExpression ?? "")} onChange={(e) => setContent({ correctExpression: e.target.value })} />
        </FormField>
        <FormField label="Numeric Tolerance (±)" htmlFor="q-eq-tolerance">
          <Input id="q-eq-tolerance" type="number" min={0} value={Number(content.tolerance ?? 0)} onChange={(e) => setContent({ tolerance: Number(e.target.value) })} />
        </FormField>
      </div>
    );
  }

  return null;
}
