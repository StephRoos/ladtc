/**
 * Import extracted Facebook group posts into the SocialPost table.
 *
 * - Reads a JSON file (single post or array) as produced by
 *   scripts/extract-facebook-posts.ts (POC, Phase 0).
 * - Re-hosts images to the club Nextcloud (cloud.ladtc.be, folder "Fil"):
 *   WebDAV upload + automatic public share link. The site stores only links
 *   (same pattern as the gallery) — Facebook CDN URLs expire.
 *   Falls back to local public/uploads/fil/ when Nextcloud env vars are
 *   missing (dev without credentials).
 * - Idempotent: upsert on externalId, deterministic file names (hash of the
 *   source URL), never overwrites blogPostId (the public vitrine link, set by
 *   Phase 3 publishing).
 *
 * Env (Nextcloud re-hosting):
 *   NEXTCLOUD_BASE_URL      e.g. https://cloud.ladtc.be
 *   NEXTCLOUD_USER          upload account (admin)
 *   NEXTCLOUD_APP_PASSWORD  application password (never the main password)
 *   NEXTCLOUD_FIL_DIR       target folder, default "Fil"
 *
 * Run with: pnpm import:social <path-to-json>
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

interface ExtractedPost {
  externalId: string;
  authorName: string | null;
  content: string;
  mediaUrls: string[];
  permalink: string | null;
  postedAt: string | null;
}

/** Local fallback directory when Nextcloud is not configured (gitignored). */
const LOCAL_UPLOAD_DIR = join(process.cwd(), "public", "uploads", "fil");

/** Public URL prefix served by Next.js for locally re-hosted images. */
const LOCAL_UPLOAD_URL_PREFIX = "/uploads/fil";

/** Facebook CDN image fetch timeout (ms). */
const FETCH_TIMEOUT_MS = 20000;

interface NextcloudConfig {
  baseUrl: string;
  user: string;
  appPassword: string;
  dir: string;
}

/**
 * Read Nextcloud config from the environment.
 * @returns Config or null when any required variable is missing
 */
function nextcloudConfig(): NextcloudConfig | null {
  const baseUrl = process.env.NEXTCLOUD_BASE_URL;
  const user = process.env.NEXTCLOUD_USER;
  const appPassword = process.env.NEXTCLOUD_APP_PASSWORD;
  if (!baseUrl || !user || !appPassword) return null;
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    user,
    appPassword,
    dir: process.env.NEXTCLOUD_FIL_DIR || "Fil",
  };
}

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 1,
  février: 2,
  mars: 3,
  avril: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  août: 8,
  septembre: 9,
  octobre: 10,
  novembre: 11,
  décembre: 12,
};

/**
 * Parse a French absolute date as rendered by Facebook ("25 septembre 2025").
 * Relative dates ("2 h", "hier") return null — the importer skips them.
 * @param text - Raw date text extracted from the post
 * @returns Parsed date or null when not an absolute French date
 */
function parseFrenchDate(text: string | null): Date | null {
  if (!text) return null;
  const normalized = text.toLowerCase().trim();
  const match = normalized.match(/(\d{1,2})\s+([a-zéûôàèù]+)\s+(\d{4})/);
  if (!match) return null;
  const month = FRENCH_MONTHS[match[2]];
  if (!month) return null;
  const day = parseInt(match[1], 10);
  const year = parseInt(match[3], 10);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return isNaN(date.getTime()) ? null : date;
}

/** Markers where the extracted innerText transitions from the post itself to
 *  its comments/reactions (captured by the container-level innerText grab). */
const COMMENT_MARKERS = [
  "Plus pertinents",
  "Répondre en tant que",
  "Plus de commentaires pertinents",
];

/** Trailing reaction counts (standalone numbers) left after comment cutting. */
const TRAILING_COUNTS = /\n\d+\n?\d*$/;

/**
 * Strip leading junk lines duplicated from the post header (status indicator,
 * presence, author name, role, bullet separators) and everything from the
 * first comment-section marker on, so the wall displays clean post text.
 * @param content - Raw post text from extraction
 * @param authorName - Extracted author name
 * @param dateText - Raw date text extracted from the post
 * @returns Cleaned content
 */
function cleanContent(
  content: string,
  authorName: string | null,
  dateText: string | null,
): string {
  const junkPatterns: RegExp[] = [
    /^Indicateur de statut/i,
    /^En ligne$/,
    /^Admin$/i,
    /^Modérateur$/i,
    /^La DTC \(groupe privé\)$/i,
    /^\s*·\s*$/,
    /^\s*$/,
  ];
  if (authorName) junkPatterns.push(new RegExp(`^${escapeRegExp(authorName.trim())}$`, "i"));
  if (dateText) junkPatterns.push(new RegExp(`^${escapeRegExp(dateText.trim())}$`, "i"));

  const lines = content.split("\n");
  const cleaned: string[] = [];
  for (const line of lines) {
    if (COMMENT_MARKERS.some((marker) => line.includes(marker))) break;
    if (junkPatterns.some((pattern) => pattern.test(line))) continue;
    cleaned.push(line);
  }
  return cleaned
    .join("\n")
    .trim()
    .replace(TRAILING_COUNTS, "")
    .trim();
}

/**
 * Escape a string for literal use inside a RegExp.
 * @param text - Raw text
 * @returns Escaped text
 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Download a Facebook CDN image.
 * @param url - Facebook CDN image URL
 * @returns Image bytes with content type, or null on failure
 */
async function downloadImage(
  url: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.warn(`  ⚠ Image download failed (${response.status}): ${url.slice(0, 60)}…`);
      return null;
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      console.warn(`  ⚠ Not an image (${contentType}): ${url.slice(0, 60)}…`);
      return null;
    }
    return { buffer: Buffer.from(await response.arrayBuffer()), contentType };
  } catch (error) {
    console.warn(
      `  ⚠ Image download error: ${error instanceof Error ? error.message : url.slice(0, 60)}`,
    );
    return null;
  }
}

/**
 * Ensure the target folder exists on Nextcloud (WebDAV MKCOL; 405 = exists).
 * @param nc - Nextcloud configuration
 */
async function ensureNextcloudDir(nc: NextcloudConfig): Promise<void> {
  const auth = Buffer.from(`${nc.user}:${nc.appPassword}`).toString("base64");
  const response = await fetch(
    `${nc.baseUrl}/remote.php/dav/files/${encodeURIComponent(nc.user)}/${encodeURIComponent(nc.dir)}`,
    { method: "MKCOL", headers: { Authorization: `Basic ${auth}` } },
  );
  if (!response.ok && response.status !== 405 && response.status !== 301) {
    throw new Error(`MKCOL ${nc.dir} failed: ${response.status}`);
  }
}

/**
 * Find an existing public-link share for a file, or create one.
 * @param nc - Nextcloud configuration
 * @param path - Full Nextcloud path of the file (e.g. "Fil/abc.jpg")
 * @returns Public share URL ("…/s/TOKEN")
 */
async function nextcloudShareUrl(nc: NextcloudConfig, path: string): Promise<string> {
  const auth = Buffer.from(`${nc.user}:${nc.appPassword}`).toString("base64");
  const headers = {
    Authorization: `Basic ${auth}`,
    "OCS-APIRequest": "true",
    Accept: "application/json",
  };
  const filePath = `/${nc.dir}/${path}`;

  // Look up an existing public share first (idempotency across re-imports).
  const listUrl = `${nc.baseUrl}/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json&reshares=true&shared_with_me=false&subfiles=true`;
  const listed = await fetch(`${listUrl}&path=${encodeURIComponent(filePath)}`, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (listed.ok) {
    const body = (await listed.json()) as { ocs?: { data?: Array<{ share_type?: number; token?: string }> } };
    const shares = body.ocs?.data ?? [];
    const link = shares.find((s) => s.share_type === 3 && s.token);
    if (link?.token) return `${nc.baseUrl}/s/${link.token}`;
  }

  // Create the share (public link, read-only).
  const form = new URLSearchParams({
    path: filePath,
    shareType: "3",
    permissions: "1",
  });
  const created = await fetch(
    `${nc.baseUrl}/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    },
  );
  const body = (await created.json()) as {
    ocs?: { meta?: { message?: string; statuscode?: number }; data?: { token?: string } };
  };
  const token = body.ocs?.data?.token;
  if (!created.ok || !token) {
    throw new Error(`Share creation failed (${created.status}): ${body.ocs?.meta?.message ?? "?"}`);
  }
  return `${nc.baseUrl}/s/${token}`;
}

/**
 * Upload an image to Nextcloud and return its public share URL.
 * WebDAV PUT is idempotent (same hash → same file overwritten).
 * @param nc - Nextcloud configuration
 * @param url - Facebook CDN image URL
 * @param image - Downloaded image bytes
 * @returns Public share URL
 */
async function uploadToNextcloud(
  nc: NextcloudConfig,
  url: string,
  image: { buffer: Buffer; contentType: string },
): Promise<string> {
  const auth = Buffer.from(`${nc.user}:${nc.appPassword}`).toString("base64");
  const ext =
    image.contentType === "image/png"
      ? "png"
      : image.contentType === "image/webp"
        ? "webp"
        : "jpg";
  // Hash the source URL so re-importing the same image reuses the same file.
  const filename = `${createHash("sha256").update(url).digest("hex").slice(0, 32)}.${ext}`;
  const davPath = `${nc.baseUrl}/remote.php/dav/files/${encodeURIComponent(nc.user)}/${encodeURIComponent(nc.dir)}/${filename}`;

  const put = await fetch(davPath, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": image.contentType,
    },
    body: new Uint8Array(image.buffer),
    signal: AbortSignal.timeout(60000),
  });
  if (!put.ok) {
    throw new Error(`WebDAV PUT failed: ${put.status}`);
  }
  return nextcloudShareUrl(nc, filename);
}

/**
 * Store an image locally (fallback when Nextcloud is not configured).
 * @param url - Facebook CDN image URL
 * @param image - Downloaded image bytes
 * @returns Public URL of the stored image
 */
async function storeLocally(
  url: string,
  image: { buffer: Buffer; contentType: string },
): Promise<string> {
  const ext =
    image.contentType === "image/png"
      ? "png"
      : image.contentType === "image/webp"
        ? "webp"
        : "jpg";
  // Hash the source URL so re-importing the same image overwrites the same
  // file instead of leaving orphaned copies behind.
  const filename = `${createHash("sha256").update(url).digest("hex").slice(0, 32)}.${ext}`;
  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await writeFile(join(LOCAL_UPLOAD_DIR, filename), image.buffer);
  return `${LOCAL_UPLOAD_URL_PREFIX}/${filename}`;
}

/**
 * Re-host a Facebook CDN image: Nextcloud first, local fallback.
 * @param url - Facebook CDN image URL
 * @param nc - Nextcloud configuration or null
 * @returns Hosted URL, or null on failure
 */
async function rehostImage(url: string, nc: NextcloudConfig | null): Promise<string | null> {
  const image = await downloadImage(url);
  if (!image) return null;
  if (nc) {
    try {
      return await uploadToNextcloud(nc, url, image);
    } catch (error) {
      console.warn(`  ⚠ Nextcloud upload failed (${error instanceof Error ? error.message : "?"}) — local fallback`);
    }
  }
  return storeLocally(url, image);
}

/**
 * Import a batch of extracted posts into the SocialPost table.
 * @param posts - Extracted posts (Facebook group, private)
 * @param nc - Nextcloud configuration or null (local fallback)
 */
async function importPosts(posts: ExtractedPost[], nc: NextcloudConfig | null): Promise<void> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    if (!post.externalId || !post.content) {
      console.warn(`  ⚠ Missing externalId or content — skipped`);
      skipped++;
      continue;
    }

    const mediaUrls: string[] = [];
    for (const url of post.mediaUrls ?? []) {
      const hosted = await rehostImage(url, nc);
      if (hosted) mediaUrls.push(hosted);
    }

    const postedAt = parseFrenchDate(post.postedAt);
    const data = {
      platform: "FACEBOOK" as const,
      authorName: post.authorName,
      content: cleanContent(post.content, post.authorName, post.postedAt),
      mediaUrls,
      permalink: post.permalink,
      postedAt,
    };

    const existing = await prisma.socialPost.findUnique({
      where: { externalId: post.externalId },
      select: { id: true },
    });

    await prisma.socialPost.upsert({
      where: { externalId: post.externalId },
      create: { externalId: post.externalId, ...data },
      // Refresh extraction fields but never touch blogPostId (vitrine link)
      update: data,
    });

    if (existing) {
      updated++;
    } else {
      created++;
    }
    console.log(`  ✓ ${post.externalId} — ${post.authorName ?? "?"} — ${mediaUrls.length} image(s)`);
  }

  console.log(`\nImport done: ${created} created, ${updated} updated, ${skipped} skipped`);
  await prisma.$disconnect();
}

async function main(): Promise<void> {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: pnpm import:social <path-to-json>");
    process.exit(1);
  }

  const nc = nextcloudConfig();
  if (nc) {
    console.log(`Nextcloud re-hosting: ${nc.baseUrl} → ${nc.dir}/`);
    await ensureNextcloudDir(nc);
  } else {
    console.log("Nextcloud not configured — falling back to local uploads");
  }

  const raw = await readFile(inputPath, "utf-8");
  const parsed: unknown = JSON.parse(raw);

  let posts: ExtractedPost[];
  if (Array.isArray(parsed)) {
    posts = parsed as ExtractedPost[];
  } else if (parsed && typeof parsed === "object" && "externalId" in parsed) {
    posts = [parsed as ExtractedPost];
  } else {
    console.error("Invalid JSON: expected a post object or an array of posts");
    process.exit(1);
  }

  console.log(`Importing ${posts.length} post(s) from ${inputPath}\n`);
  await importPosts(posts, nc);
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
