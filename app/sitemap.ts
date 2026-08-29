import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { subjects } from "@/lib/content/subjects";
import { classBands } from "@/lib/content/classes";

const staticRoutes = [
  "",
  "/about",
  "/how-it-works",
  "/one-to-one-tuition",
  "/book-counselling",
  "/subjects",
  "/classes",
  "/skills",
  "/knowledge",
  "/mentors",
  "/become-a-mentor",
  "/faq",
  "/contact",
  "/resources",
  "/login",
  "/signup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const subjectEntries: MetadataRoute.Sitemap = subjects.map((subject) => ({
    url: `${SITE_URL}/subjects/${subject.slug}`,
    lastModified: new Date(),
  }));

  const classEntries: MetadataRoute.Sitemap = classBands.map((band) => ({
    url: `${SITE_URL}/classes/${band.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...subjectEntries, ...classEntries];
}
