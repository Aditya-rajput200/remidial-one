import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Profile photos and whiteboard uploads are served from Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
