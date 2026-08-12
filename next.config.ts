import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is disabled via --webpack flag in dev script
  webpack: (config) => {
    if (!process.env.VERCEL) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};