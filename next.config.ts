import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React strict mode for development
  reactStrictMode: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_WP_API_URL: process.env.NEXT_PUBLIC_WP_API_URL || "https://ladtc.be",
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ladtc.be",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.wp.com",
      },
    ],
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
