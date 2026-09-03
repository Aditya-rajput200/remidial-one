import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { JsonLd } from "@/components/ui/JsonLd";
import { prisma } from "@/lib/db/prisma";
import { buildMetadata, articleJsonLd } from "@/lib/seo";

export const revalidate = 60;

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { name: true, avatarUrl: true } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return buildMetadata({ title: "Post not found", description: "", path: `/blog/${slug}`, noIndex: true });

  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    ogType: "article",
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const wordCount = post.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const publishedAt = post.publishedAt ?? post.createdAt;

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          authorName: post.author.name,
          publishedAt: publishedAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          imageUrl: post.coverImageUrl,
        })}
      />
      <Section className="pb-6 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]} />
        <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-5">
          {post.category ? <Badge tone="lime">{post.category}</Badge> : null}
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            {post.title}
          </h1>
          <p className="text-base leading-relaxed text-muted sm:text-lg">{post.excerpt}</p>
          <div className="flex items-center gap-3 border-t border-border pt-5">
            <Avatar src={post.author.avatarUrl} alt={post.author.name} size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-ink">{post.author.name}</span>
              <span className="text-xs text-muted-2">
                {publishedAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                {" · "}
                {readTimeMinutes} min read
              </span>
            </div>
          </div>
        </div>
      </Section>

      {post.coverImageUrl ? (
        <Section className="pb-0 pt-0">
          <div className="relative mx-auto aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-3xl bg-surface">
            <Image src={post.coverImageUrl} alt="" fill className="object-cover" priority />
          </div>
        </Section>
      ) : null}

      <Section className="pt-8">
        <div
          className="prose-blog mx-auto max-w-3xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        {post.tags.length > 0 ? (
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-2 border-t border-border pt-6">
            {post.tags.map((tag) => (
              <Badge key={tag} tone="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </Section>
    </>
  );
}
