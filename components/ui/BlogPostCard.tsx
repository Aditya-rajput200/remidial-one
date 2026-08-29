import Link from "next/link";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export type BlogPostPreview = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  category: string | null;
  publishedAt: string | null;
  readTimeMinutes: number;
  author: { name: string; avatarUrl: string | null };
};

export function BlogPostCard({ post }: { post: BlogPostPreview }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card interactive className="flex h-full flex-col gap-0 overflow-hidden p-0">
        <div className="relative aspect-[16/9] w-full shrink-0 bg-surface">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-2">
              <Newspaper className="h-8 w-8" strokeWidth={1.5} aria-hidden />
            </div>
          )}
          {post.category ? (
            <Badge tone="lime" className="absolute left-4 top-4">
              {post.category}
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="text-lg font-semibold leading-snug text-ink">{post.title}</h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
          <div className="mt-auto flex items-center gap-2.5 pt-2">
            <Avatar src={post.author.avatarUrl} alt={post.author.name} size="sm" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-ink">{post.author.name}</span>
              <span className="text-xs text-muted-2">
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""}
                {" · "}
                {post.readTimeMinutes} min read
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
