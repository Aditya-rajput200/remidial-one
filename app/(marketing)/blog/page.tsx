import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { BlogListing } from "@/components/blog/BlogListing";
import { prisma } from "@/lib/db/prisma";
import { buildMetadata, websiteJsonLd } from "@/lib/seo";
import type { BlogPostPreview } from "@/components/ui/BlogPostCard";

export const metadata = buildMetadata({
  title: "Blog",
  description:
    "Practical guidance on remedial learning, closing learning gaps, study habits, and personalized 1-to-1 education from the Remedial One team.",
  path: "/blog",
});

export const revalidate = 60;

const PAGE_SIZE = 9;

function toPreview(post: {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  category: string | null;
  publishedAt: Date | null;
  content: string;
  author: { name: string; avatarUrl: string | null };
}): BlogPostPreview {
  const wordCount = post.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    category: post.category,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    readTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    author: post.author,
  };
}

export default async function BlogIndexPage() {
  // Plain Promise.all, not $transaction — these are independent reads for a
  // paginated listing, and Neon's pooled endpoint can be slow to hand over a
  // connection for a batch transaction (cold-start latency), which was
  // tripping Prisma's "Unable to start a transaction in the given time"
  // error. A post published between these two calls making the count
  // momentarily stale by one is harmless here.
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: PAGE_SIZE,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImageUrl: true,
        category: true,
        publishedAt: true,
        content: true,
        author: { select: { name: true, avatarUrl: true } },
      },
    }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="Blog"
            title="Notes on remedial learning, done well."
            description="Practical guidance on closing learning gaps, study habits, and personalized 1-to-1 education — for students, parents, and mentors."
          />
        </div>
      </Section>

      <Section tone="surface" className="pt-0">
        <BlogListing initialPosts={posts.map(toPreview)} initialTotal={total} pageSize={PAGE_SIZE} />
      </Section>
    </>
  );
}
