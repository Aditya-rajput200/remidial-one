"use client";

import { use, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SkeletonForm } from "@/components/dashboard/DashboardSkeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileWarning } from "lucide-react";
import { BlogEditor, type BlogPostFormValue } from "@/components/admin/BlogEditor";

export default function EditBlogPostPage(props: PageProps<"/admin/blog/[id]/edit">) {
  const { id } = use(props.params);
  const [post, setPost] = useState<BlogPostFormValue | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setPost(body?.post ?? null));
  }, [id]);

  return (
    <div>
      <PageHeader title="Edit Post" description="Update and republish this post." />
      {post === undefined ? (
        <SkeletonForm fields={5} />
      ) : post === null ? (
        <EmptyState icon={FileWarning} title="Post not found" description="It may have been deleted." />
      ) : (
        <BlogEditor initial={post} />
      )}
    </div>
  );
}
