import * as Sentry from "@sentry/nextjs";

// Client-side Sentry initialization for Turbopack (Next.js 15+)
// Replaces sentry.client.config.ts which only works with webpack
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enabled: process.env.NODE_ENV === "production",
  integrations: [
    Sentry.replayIntegration(),
  ],
});

// Required by @sentry/nextjs to instrument client-side navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
