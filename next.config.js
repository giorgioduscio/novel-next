/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['argon2'],
  turbopack: {},
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
  // Configurazione per accesso da rete locale
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.1.174:3000'],
    },
  },
  // Permetti accessi cross-origin in development
  allowedDevOrigins: ['192.168.1.174'],
};

module.exports = nextConfig;
