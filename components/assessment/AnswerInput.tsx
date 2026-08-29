"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type Option = { id: string; text: string };

export function AnswerInput({
  type,
  content,
  response,
  onChange,
  onUploadAttachment,
  attachments,
}: {
  type: string;
  content: Record<string, unknown>;
  response: Record<string, unknown> | null;
  onChange: (response: Record<string, unknown>) => void;
  onUploadAttachment?: (file: File) => Promise<void>;
  attachments?: { id: string; fileUrl: string; fileName: string }[];
}) {
  if (type === "MCQ") {
    const options = (content.options as Option[]) ?? [];
    return (
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
              response?.selectedOptionId === opt.id ? "border-ink bg-surface" : "border-border hover:border-ink/30"
            }`}
          >
            <input
              type="radio"
              checked={response?.selectedOptionId === opt.id}
              onChange={() => onChange({ selectedOptionId: opt.id })}
              className="h-4 w-4"
            />
            {opt.text}
          </label>
        ))}
      </div>
    );
  }

  if (type === "MULTIPLE_CORRECT") {
    const options = (content.options as Option[]) ?? [];
    const selected = (response?.selectedOptionIds as string[]) ?? [];
    return (
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
              selected.includes(opt.id) ? "border-ink bg-surface" : "border-border hover:border-ink/30"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.id)}
              onChange={() =>
                onChange({ selectedOptionIds: selected.includes(opt.id) ? selected.filter((s) => s !== opt.id) : [...selected, opt.id] })
              }
              className="h-4 w-4"
            />
            {opt.text}
          </label>
        ))}
      </div>
    );
  }

  if (type === "TRUE_FALSE") {
    return (
      <div className="flex gap-3">
        {[true, false].map((val) => (
          <button
            key={String(val)}
            onClick={() => onChange({ value: val })}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              response?.value === val ? "border-ink bg-surface" : "border-border hover:border-ink/30"
            }`}
          >
            {val ? "True" : "False"}
          </button>
        ))}
      </div>
    );
  }

  if (type === "FILL_BLANK") {
    return (
      <Input
        value={String(response?.text ?? "")}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Type your answer"
      />
    );
  }

  if (type === "NUMERICAL") {
    return (
      <Input
        type="number"
        value={response?.value === undefined || response?.value === null ? "" : String(response.value)}
        onChange={(e) => onChange({ value: Number(e.target.value) })}
        placeholder="Enter a number"
      />
    );
  }

  if (type === "EQUATION") {
    return (
      <Input
        value={String(response?.text ?? "")}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="e.g. x=5"
      />
    );
  }

  if (type === "MATCH_FOLLOWING") {
    const left = (content.left as Option[]) ?? [];
    const right = (content.right as Option[]) ?? [];
    const pairs = (response?.pairs as { leftId: string; rightId: string }[]) ?? [];
    function setPair(leftId: string, rightId: string) {
      onChange({ pairs: [...pairs.filter((p) => p.leftId !== leftId), ...(rightId ? [{ leftId, rightId }] : [])] });
    }
    return (
      <div className="flex flex-col gap-2.5">
        {left.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_1fr] items-center gap-3">
            <p className="text-sm text-ink">{item.text}</p>
            <Select value={pairs.find((p) => p.leftId === item.id)?.rightId ?? ""} onChange={(e) => setPair(item.id, e.target.value)}>
              <option value="">Choose a match…</option>
              {right.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.text}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>
    );
  }

  if (type === "SHORT_ANSWER" || type === "LONG_ANSWER") {
    return (
      <Textarea
        value={String(response?.text ?? "")}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={type === "LONG_ANSWER" ? 10 : 4}
        placeholder="Type your answer"
      />
    );
  }

  if (type === "IMAGE_ANSWER") {
    return <ImageAnswerInput content={content} response={response} onChange={onChange} onUploadAttachment={onUploadAttachment} attachments={attachments} />;
  }

  return null;
}

function ImageAnswerInput({
  content,
  response,
  onChange,
  onUploadAttachment,
  attachments,
}: {
  content: Record<string, unknown>;
  response: Record<string, unknown> | null;
  onChange: (response: Record<string, unknown>) => void;
  onUploadAttachment?: (file: File) => Promise<void>;
  attachments?: { id: string; fileUrl: string; fileName: string }[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {content.instructions ? <p className="text-sm text-muted">{String(content.instructions)}</p> : null}
      <div className="flex flex-wrap gap-3">
        {attachments?.map((att) => (
          <a key={att.id} href={att.fileUrl} target="_blank" rel="noreferrer" className="block h-24 w-24 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={att.fileUrl} alt={att.fileName} className="h-full w-full object-cover" />
          </a>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !onUploadAttachment) return;
          setUploading(true);
          await onUploadAttachment(file);
          setUploading(false);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <Button type="button" variant="secondary-outline" size="sm" className="w-fit gap-1.5" onClick={() => inputRef.current?.click()} disabled={uploading}>
        <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload Photo / Scan"}
      </Button>
      <Textarea
        value={String(response?.note ?? "")}
        onChange={(e) => onChange({ ...response, note: e.target.value })}
        placeholder="Add a note (optional)"
        rows={2}
      />
    </div>
  );
}
