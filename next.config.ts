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
      // /how-it-works and /resources are anchored sections on /one-to-one-tuition
      // — keep the old URLs alive for anyone with them bookmarked/indexed.
      // ("/subjects" and "/skills" are now standalone hub pages with their own
      // per-item detail pages, so they're no longer redirected.)
      { source: "/how-it-works", destination: "/one-to-one-tuition#how-it-works", permanent: true },
      { source: "/resources", destination: "/one-to-one-tuition#resources", permanent: true },
      // "home tuition" (the highest-volume commercial term in the keyword map)
      // is targeted on the core /online-tuition page — /home-tuition is an alias
      // so the natural URL resolves to the canonical money page.
      { source: "/home-tuition", destination: "/online-tuition", permanent: true },
    ];
  },
};

export default nextConfig;
