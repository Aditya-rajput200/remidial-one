import { PageHeader } from "@/components/dashboard/PageHeader";
import { BlogEditor } from "@/components/admin/BlogEditor";

export default function NewBlogPostPage() {
  return (
    <div>
      <PageHeader title="New Post" description="Draft a new post for the Remedial One blog." />
      <BlogEditor />
    </div>
  );
}
