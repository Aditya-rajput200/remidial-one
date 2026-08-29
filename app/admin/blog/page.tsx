"use client";

import { useEffect, useState } from "react";
import { Newspaper, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/dashboard/DashboardSkeletons";

type PostRow = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  category: string | null;
  updatedAt: string;
  author: { name: string };
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<PostRow[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function loadPosts() {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((body) => setPosts(body.posts ?? []));
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This can't be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) setPosts((prev) => prev?.filter((p) => p.id !== id) ?? null);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Blog"
        description="Write and publish posts to the public Remedial One blog."
        action={
          <Button href="/admin/blog/new" variant="primary-lime" className="gap-1.5">
            <Plus className="h-4 w-4" aria-hidden />
            New Post
          </Button>
        }
      />

      {posts === null ? (
        <SkeletonTable rows={5} cols={4} />
      ) : posts.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-2">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{post.title}</div>
                    {post.category ? <div className="text-xs text-muted">{post.category}</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={post.status === "PUBLISHED" ? "lime" : "outline"}>{post.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{post.author.name}</td>
                  <td className="px-4 py-3 text-muted">{new Date(post.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button href={`/admin/blog/${post.id}/edit`} size="sm" variant="secondary-outline">
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        aria-label="Delete post"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-error/10 hover:text-error disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Newspaper}
          title="No posts yet"
          description="Write your first post to publish it to the public blog."
          action={
            <Button href="/admin/blog/new" variant="primary-lime">
              New Post
            </Button>
          }
        />
      )}
    </div>
  );
}
