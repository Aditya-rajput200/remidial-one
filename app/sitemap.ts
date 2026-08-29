import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { subjects } from "@/lib/content/subjects";
import { classBands } from "@/lib/content/classes";
import { prisma } from "@/lib/db/prisma";

// Note: "/subjects", "/skills", "/how-it-works", and "/resources" are deliberately
// excluded — they 301-redirect into anchored sections on "/one-to-one-tuition"
// (see next.config.ts) and a redirecting URL has no business in the sitemap.
// priority/changeFrequency signal relative crawl importance — not a ranking
// factor, but it steers crawl budget toward the pages that actually convert.
const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/one-to-one-tuition", priority: 0.9, changeFrequency: "weekly" },
  { path: "/personalized-learning", priority: 0.9, changeFrequency: "monthly" },
  { path: "/remedial-classes", priority: 0.9, changeFrequency: "monthly" },
  { path: "/learning-gap-assessment", priority: 0.9, changeFrequency: "monthly" },
  { path: "/mentors", priority: 0.8, changeFrequency: "weekly" },
  { path: "/book-counselling", priority: 0.8, changeFrequency: "monthly" },
  { path: "/classes", priority: 0.7, changeFrequency: "monthly" },
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

  return [...staticEntries, ...subjectEntries, ...classEntries, ...blogEntries];
}
