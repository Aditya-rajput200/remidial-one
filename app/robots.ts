import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Private/app routes kept out of both the default crawl and AI-crawler rules —
// only marketing/content pages should ever be indexed or cited.
const disallow = [
  "/api/",
  "/admin/",
  "/student/",
  "/mentor/",
  "/session/",
  "/assessment/",
  "/book/",
];

// Named explicitly (rather than relying only on the "*" rule) so AI Overviews,
// ChatGPT search, Perplexity, and Copilot can crawl and cite marketing content —
// an explicit allow avoids these being caught by any future narrower "*" rule.
const aiCrawlers = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "Amazonbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
