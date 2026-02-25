import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // React strict mode for development
  reactStrictMode: true,

  // Standalone output for Docker deployment
  output: "standalone",

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ladtc.be",
        pathname: "/**",
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

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "",
  project: "",
});
