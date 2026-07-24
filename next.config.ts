import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Abilita il watch per il hot-reload
    config.watchOptions = {
      poll: 1000, // Controlla le modifiche ogni secondo
      aggregateTimeout: 300,
      ignored: /node_modules/,
    };
    return config;
  },
};

export default nextConfig;
