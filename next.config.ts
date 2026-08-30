import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Profile photos and whiteboard uploads are served from Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async redirects() {
    return [
      // Canonical host is www.remedial-one.in (matches SITE_URL in lib/seo.ts
      // and the sitemap it generates) — force the apex domain over to it so
      // Googlebot never crawls/reads the sitemap from a host that doesn't
      // match the URLs inside it (that mismatch is what Search Console's
      // "URL not allowed for a Sitemap at this location" error means).
      {
        source: "/:path*",
        has: [{ type: "host", value: "remedial-one.in" }],
        destination: "https://www.remedial-one.in/:path*",
        permanent: true,
      },
      // /subjects, /skills, /how-it-works, and /resources were merged into a
      // single /one-to-one-tuition page with anchored sections — keep the old
      // URLs alive for anyone with them bookmarked/indexed.
      { source: "/subjects", destination: "/one-to-one-tuition#subjects", permanent: true },
      { source: "/skills", destination: "/one-to-one-tuition#skills", permanent: true },
      { source: "/how-it-works", destination: "/one-to-one-tuition#how-it-works", permanent: true },
      { source: "/resources", destination: "/one-to-one-tuition#resources", permanent: true },
    ];
  },
};

export default nextConfig;
