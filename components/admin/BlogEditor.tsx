"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { BlogCoverUploader } from "@/components/admin/BlogCoverUploader";
import { slugify } from "@/lib/blog/slugify-client";
import { useSession } from "@/lib/auth/SessionProvider";

export type BlogPostFormValue = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  category: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  status: "DRAFT" | "PUBLISHED";
};

const EMPTY: BlogPostFormValue = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: null,
  category: null,
  tags: [],
  seoTitle: null,
  seoDescription: null,
  status: "DRAFT",
};

export function BlogEditor({ initial }: { initial?: BlogPostFormValue }) {
  const router = useRouter();
  const { session } = useSession();
  const canPublish = session?.role === "super_admin" || session?.role === "content_manager";

  const [value, setValue] = useState<BlogPostFormValue>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [tagInput, setTagInput] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState("");

  function update<K extends keyof BlogPostFormValue>(key: K, val: BlogPostFormValue[K]) {
    setValue((prev) => ({ ...prev, [key]: val }));
  }

  function handleTitleChange(title: string) {
    update("title", title);
    if (!slugTouched) update("slug", slugify(title));
  }

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || value.tags.includes(tag)) return;
    update("tags", [...value.tags, tag]);
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
      setTagInput("");
    } else if (event.key === "Backspace" && !tagInput && value.tags.length) {
      update("tags", value.tags.slice(0, -1));
    }
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    if (!value.title.trim() || !value.excerpt.trim() || !value.content.trim()) {
      setError("Title, excerpt, and content are required.");
      return;
    }

    setSaving(status === "PUBLISHED" ? "publish" : "draft");
    setError("");

    const payload = { ...value, status };
    const endpoint = value.id ? `/api/admin/blog/${value.id}` : "/api/admin/blog";
    const method = value.id ? "PATCH" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(null);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Could not save post.");
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave("DRAFT");
      }}
      className="flex flex-col gap-6"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <Card>
            <div className="flex flex-col gap-5">
              <FormField label="Title" htmlFor="post-title">
                <Input
                  id="post-title"
                  value={value.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Five Habits of Students Who Close Learning Gaps Fast"
                  required
                />
              </FormField>
              <FormField label="URL slug" htmlFor="post-slug" hint={`/blog/${value.slug || "your-post-slug"}`}>
                <Input
                  id="post-slug"
                  value={value.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update("slug", slugify(e.target.value));
                  }}
                  placeholder="your-post-slug"
                />
              </FormField>
              <FormField label="Excerpt" htmlFor="post-excerpt" hint="Shown on the blog listing and in search results.">
                <Textarea
                  id="post-excerpt"
                  value={value.excerpt}
                  onChange={(e) => update("excerpt", e.target.value)}
                  rows={3}
                  maxLength={400}
                  required
                />
              </FormField>
            </div>
          </Card>

          <Card>
            <label className="mb-2 block text-sm font-medium text-ink">Content</label>
            <RichTextEditor value={value.content} onChange={(html) => update("content", html)} />
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <BlogCoverUploader coverImageUrl={value.coverImageUrl} onChange={(url) => update("coverImageUrl", url)} />
          </Card>

          <Card>
            <div className="flex flex-col gap-5">
              <FormField label="Category" htmlFor="post-category">
                <Input
                  id="post-category"
                  value={value.category ?? ""}
                  onChange={(e) => update("category", e.target.value || null)}
                  placeholder="e.g. Study Tips"
                />
              </FormField>
              <FormField label="Tags" htmlFor="post-tags" hint="Press Enter or comma to add.">
                <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-white p-2">
                  {value.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => update("tags", value.tags.filter((t) => t !== tag))}
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-3 w-3" aria-hidden />
                      </button>
                    </span>
                  ))}
                  <input
                    id="post-tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => {
                      addTag(tagInput);
                      setTagInput("");
                    }}
                    placeholder={value.tags.length ? "" : "e.g. remedial-learning"}
                    className="min-w-[8ch] flex-1 border-none bg-transparent px-1 py-1 text-sm text-ink outline-none"
                  />
                </div>
              </FormField>
            </div>
          </Card>

          <Card>
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-medium text-ink"
            >
              SEO settings
              {seoOpen ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
            </button>
            {seoOpen ? (
              <div className="mt-4 flex flex-col gap-4">
                <FormField
                  label="SEO title"
                  htmlFor="post-seo-title"
                  hint={`${(value.seoTitle ?? "").length}/70`}
                >
                  <Input
                    id="post-seo-title"
                    value={value.seoTitle ?? ""}
                    onChange={(e) => update("seoTitle", e.target.value || null)}
                    maxLength={70}
                    placeholder="Defaults to the post title"
                  />
                </FormField>
                <FormField
                  label="SEO description"
                  htmlFor="post-seo-description"
                  hint={`${(value.seoDescription ?? "").length}/160`}
                >
                  <Textarea
                    id="post-seo-description"
                    value={value.seoDescription ?? ""}
                    onChange={(e) => update("seoDescription", e.target.value || null)}
                    maxLength={160}
                    rows={3}
                    placeholder="Defaults to the excerpt"
                  />
                </FormField>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Button type="submit" variant="secondary-outline" disabled={saving !== null}>
          {saving === "draft" ? "Saving…" : "Save Draft"}
        </Button>
        {canPublish ? (
          <Button
            type="button"
            variant="primary-lime"
            disabled={saving !== null}
            onClick={() => handleSave("PUBLISHED")}
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </Button>
        ) : null}
        {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
      </div>
    </form>
  );
}
