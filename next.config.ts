import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      // Cloudflare R2 public URL
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
    ],
    // Allow local images from public directory
    unoptimized: false,
  },
};

export default nextConfig;
