import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { subjects } from "@/lib/content/subjects";
import { classBands } from "@/lib/content/classes";
import { servicePages } from "@/lib/content/onlineTuition";
import { skillPages } from "@/lib/content/skillPages";
import { learnSubjects, concepts } from "@/lib/content/learn";
import { prisma } from "@/lib/db/prisma";

// Note: "/how-it-works" and "/resources" are deliberately excluded — they
// 301-redirect into anchored sections on "/one-to-one-tuition" (see
// next.config.ts) and a redirecting URL has no business in the sitemap.
// "/subjects" and "/skills" are now real hub pages and are included.
// priority/changeFrequency signal relative crawl importance — not a ranking
// factor, but it steers crawl budget toward the pages that actually convert.
const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  // Core commercial "money" page (Track A of the SEO strategy) — the primary
  // conversion destination for buying-intent tuition queries.
  { path: "/online-tuition", priority: 0.9, changeFrequency: "weekly" },
  // /learn hub — the top of the content engine (Track B) that captures the
  // high-volume student-query traffic.
  { path: "/learn", priority: 0.8, changeFrequency: "weekly" },
  { path: "/one-to-one-tuition", priority: 0.9, changeFrequency: "weekly" },
  { path: "/personalized-learning", priority: 0.9, changeFrequency: "monthly" },
  { path: "/remedial-classes", priority: 0.9, changeFrequency: "monthly" },
  { path: "/learning-gap-assessment", priority: 0.9, changeFrequency: "monthly" },
  { path: "/mentors", priority: 0.8, changeFrequency: "weekly" },
  { path: "/book-counselling", priority: 0.8, changeFrequency: "monthly" },
  { path: "/classes", priority: 0.7, changeFrequency: "monthly" },
  { path: "/subjects", priority: 0.7, changeFrequency: "monthly" },
  { path: "/skills", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/become-a-mentor", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.6, changeFrequency: "daily" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/knowledge", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/login", priority: 0.3, changeFrequency: "yearly" },
  { path: "/signup", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const subjectEntries: MetadataRoute.Sitemap = subjects.map((subject) => ({
    url: `${SITE_URL}/subjects/${subject.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const classEntries: MetadataRoute.Sitemap = classBands.map((band) => ({
    url: `${SITE_URL}/classes/${band.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Track A — /online-tuition service pages (subject / grade / board).
  const serviceEntries: MetadataRoute.Sitemap = servicePages.map((page) => ({
    url: `${SITE_URL}/online-tuition/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Skills-beyond-academics hub — one detail page per skill.
  const skillEntries: MetadataRoute.Sitemap = skillPages.map((page) => ({
    url: `${SITE_URL}/skills/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Track B — /learn subject hubs and concept pages (the content engine).
  const learnHubEntries: MetadataRoute.Sitemap = learnSubjects.map((s) => ({
    url: `${SITE_URL}/learn/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const conceptEntries: MetadataRoute.Sitemap = concepts.map((c) => ({
    url: `${SITE_URL}/learn/${c.subjectSlug}/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticEntries,
    ...serviceEntries,
    ...learnHubEntries,
    ...conceptEntries,
    ...subjectEntries,
    ...classEntries,
    ...skillEntries,
    ...blogEntries,
  ];
}
