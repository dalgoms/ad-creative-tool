import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sharp", "satori"],
  outputFileTracingIncludes: {
    "/api/v1/creatives/generate": ["./public/fonts/**/*"],
    "/api/v1/campaigns/[id]/regenerate-assets": ["./public/fonts/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
