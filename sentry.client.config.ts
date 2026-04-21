import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Capture 20% of transactions for performance monitoring
  tracesSampleRate: 0.2,
  // Record 10% of sessions, but always record sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enabled: process.env.NODE_ENV === "production",
  integrations: [
    Sentry.replayIntegration(),
  ],
});
