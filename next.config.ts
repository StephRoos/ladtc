import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // React strict mode for development
  reactStrictMode: true,

  // Standalone output for Docker deployment
  output: "standalone",

  // With a proxy.ts present, Next buffers every request body (default 10 MB)
  // and silently truncates beyond it — which corrupts large multipart uploads
  // (gallery videos) and makes request.formData() throw. Raise the ceiling
  // above the 100 MB video limit (+ multipart overhead).
  experimental: {
    proxyClientMaxBodySize: "110mb",
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Security headers
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://ladtc.be https:",
            "media-src 'self' blob:",
            "font-src 'self'",
            "connect-src 'self' https://*.sentry.io",
            "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
            "frame-ancestors 'none'",
          ].join("; "),
        },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],

  // Image optimization — local uploads + any HTTPS source (blog/gallery external URLs)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ladtc.be",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
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
  org: "anthemion",
  project: "ladtc",
});
