"use client";

import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  ImageUp,
  Table,
  Undo2,
  Redo2,
  Eye,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize";
import { looksLikeMarkdown, markdownLiteToHtml } from "@/lib/blog/markdown-lite";

type ToolbarAction = {
  icon: typeof Bold;
  label: string;
  command: string;
  arg?: string;
};

const ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "Bold", command: "bold" },
  { icon: Italic, label: "Italic", command: "italic" },
  { icon: Underline, label: "Underline", command: "underline" },
  { icon: Heading2, label: "Heading 2", command: "formatBlock", arg: "h2" },
  { icon: Heading3, label: "Heading 3", command: "formatBlock", arg: "h3" },
  { icon: Heading4, label: "Heading 4", command: "formatBlock", arg: "h4" },
  { icon: List, label: "Bullet list", command: "insertUnorderedList" },
  { icon: ListOrdered, label: "Numbered list", command: "insertOrderedList" },
  { icon: Quote, label: "Quote", command: "formatBlock", arg: "blockquote" },
  { icon: Code, label: "Code", command: "formatBlock", arg: "pre" },
  { icon: Undo2, label: "Undo", command: "undo" },
  { icon: Redo2, label: "Redo", command: "redo" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [uploading, setUploading] = useState(false);
  const lastEmitted = useRef(value);

  // Only push `value` into the DOM when it changed from outside this editor
  // (e.g. loading a post into the edit form) — never on every keystroke,
  // which would fight the browser's own cursor position.
  useEffect(() => {
    if (editorRef.current && value !== lastEmitted.current) {
      editorRef.current.innerHTML = value;
      lastEmitted.current = value;
    }
  }, [value]);

  function emit() {
    if (!editorRef.current) return;
    const html = sanitizeBlogHtml(editorRef.current.innerHTML);
    lastEmitted.current = html;
    onChange(html);
  }

  function exec(command: string, arg?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  // Pasting from ChatGPT, Google Docs, or Word puts real HTML on the
  // clipboard (real <h1>–<h3>, <strong>, <ul> tags) — the browser's default
  // paste would carry that straight through, but also every inline style,
  // class, and wrapper span those tools add. Sanitizing it through the same
  // allowlist used on save keeps the structure (headings become h2–h4 since
  // the post title owns the page's one <h1> — see sanitizeBlogHtml) while
  // dropping the mess. If the clipboard has no HTML — e.g. markdown copied
  // from a plain-text view or a .md file — fall back to a small Markdown
  // parser so "# ", "**bold**", and "- item" become real formatting instead
  // of landing as literal characters.
  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    if (!html && !text) return;

    event.preventDefault();
    const clean = html
      ? sanitizeBlogHtml(html)
      : looksLikeMarkdown(text)
        ? sanitizeBlogHtml(markdownLiteToHtml(text))
        : "";

    if (clean) {
      document.execCommand("insertHTML", false, clean);
    } else {
      document.execCommand("insertText", false, text);
    }
    emit();
  }

  async function insertImage(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/blog/upload", { method: "POST", body: formData });
    const body = await response.json().catch(() => ({}));
    setUploading(false);
    if (!response.ok || !body.url) return;
    exec("insertImage", body.url);
  }

  function handleLink() {
    const url = window.prompt("Link URL");
    if (url) exec("createLink", url);
  }

  function insertTable() {
    const header = "<th>Header</th>".repeat(3);
    const row = "<td>Cell</td>".repeat(3);
    exec(
      "insertHTML",
      `<table><thead><tr>${header}</tr></thead><tbody><tr>${row}</tr><tr>${row}</tr></tbody></table><p><br></p>`
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-border bg-surface p-2">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.label}
            aria-label={action.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(action.command, action.arg)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/70 transition-colors hover:bg-white hover:text-ink"
          >
            <action.icon className="h-4 w-4" aria-hidden />
          </button>
        ))}
        <button
          type="button"
          title="Link"
          aria-label="Link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleLink}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/70 transition-colors hover:bg-white hover:text-ink"
        >
          <Link2 className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          title="Insert table"
          aria-label="Insert table"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertTable}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/70 transition-colors hover:bg-white hover:text-ink"
        >
          <Table className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          title="Insert image"
          aria-label="Insert image"
          disabled={uploading}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/70 transition-colors hover:bg-white hover:text-ink disabled:opacity-50"
        >
          <ImageUp className="h-4 w-4" aria-hidden />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) insertImage(file);
          }}
        />

        <div className="ml-auto flex items-center gap-1 rounded-lg bg-white p-1">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              mode === "edit" ? "bg-ink text-white" : "text-muted hover:text-ink"
            )}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              mode === "preview" ? "bg-ink text-white" : "text-muted hover:text-ink"
            )}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden />
            Preview
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable={mode === "edit"}
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className={cn(
          "prose-blog min-h-[320px] rounded-b-xl border border-border bg-white px-4 py-3 text-[15px] text-ink focus:outline-none",
          mode === "preview" && "cursor-default"
        )}
        style={{ display: mode === "edit" ? "block" : "none" }}
      />
      {mode === "preview" ? (
        <div
          className="prose-blog min-h-[320px] rounded-b-xl border border-border bg-white px-4 py-3 text-[15px] text-ink"
          dangerouslySetInnerHTML={{ __html: value || `<p class="text-muted-2">${placeholder}</p>` }}
        />
      ) : null}
    </div>
  );
}
