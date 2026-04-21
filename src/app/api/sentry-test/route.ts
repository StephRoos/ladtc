import { NextResponse } from "next/server";

/**
 * Temporary route to verify Sentry captures server-side errors.
 * Remove after confirming Sentry works in production.
 */
export function GET(): NextResponse {
  throw new Error("Sentry test error — server-side (API route)");
}
