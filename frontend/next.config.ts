import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // Required for NextAuth v5 App Router
  },
};

export default nextConfig;
