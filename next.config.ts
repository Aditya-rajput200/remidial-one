import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Profile photos and whiteboard uploads are served from Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async redirects() {
    // /subjects, /skills, /how-it-works, and /resources were merged into a
    // single /one-to-one-tuition page with anchored sections — keep the old
    // URLs alive for anyone with them bookmarked/indexed.
    return [
      { source: "/subjects", destination: "/one-to-one-tuition#subjects", permanent: true },
      { source: "/skills", destination: "/one-to-one-tuition#skills", permanent: true },
      { source: "/how-it-works", destination: "/one-to-one-tuition#how-it-works", permanent: true },
      { source: "/resources", destination: "/one-to-one-tuition#resources", permanent: true },
    ];
  },
};

export default nextConfig;
