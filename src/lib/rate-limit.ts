import type { NextRequest } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
}

/**
 * In-memory sliding-window rate limiter.
 * Suitable for the single-container Coolify deployment. State resets on
 * container restart, which is acceptable for anti-spam purposes.
 */
const store = new Map<string, RateLimitEntry>();

// Periodically purge stale entries so the map does not grow unbounded.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * Check whether a key (e.g. "contact:1.2.3.4") has exceeded its quota.
 * @param key - Unique bucket key, typically prefixed with the route name
 * @param max - Maximum number of requests allowed within the window
 * @param windowMs - Sliding window duration in milliseconds
 * @returns true when the request must be rejected (429)
 */
export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  cleanup(windowMs);

  const entry = store.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= max) {
    store.set(key, entry);
    return true;
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return false;
}

/**
 * Extract the client IP from proxy headers (Cloudflare first, then generic).
 * Falls back to "unknown" so a missing header still shares a single bucket
 * rather than bypassing the limit.
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
