/**
 * Import extracted Facebook group posts into the SocialPost table.
 *
 * - Reads a JSON file (single post or array) as produced by
 *   scripts/extract-facebook-posts.ts (POC, Phase 0).
 * - Re-hosts images into public/uploads/fil/ (Facebook CDN URLs expire).
 * - Idempotent: upsert on externalId, never overwrites blogPostId
 *   (the public vitrine link, set by Phase 3 publishing).
 *
 * Run with: pnpm import:social -- <path-to-json>
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

/** Directory where Facebook images are re-hosted (gitignored via public/uploads/*). */
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "fil");

/** Public URL prefix served by Next.js for re-hosted images. */
const UPLOAD_URL_PREFIX = "/uploads/fil";

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
const COMMENT_MARKERS = ["Plus pertinents", "Répondre en tant que", "Plus de commentaires pertinents"];

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
function cleanContent(content: string, authorName: string | null, dateText: string | null): string {
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
  return cleaned.join("\n").trim().replace(TRAILING_COUNTS, "").trim();
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
 * Download a Facebook CDN image and store it under public/uploads/fil/.
 * @param url - Facebook CDN image URL
 * @returns Public URL of the re-hosted image, or null on failure
 */
async function rehostImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      signal: AbortSignal.timeout(20000),
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
    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    // Hash the source URL so re-importing the same image overwrites the same
    // file instead of leaving orphaned copies behind.
    const filename = `${createHash("sha256").update(url).digest("hex").slice(0, 32)}.${ext}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(join(UPLOAD_DIR, filename), buffer);
    return `${UPLOAD_URL_PREFIX}/${filename}`;
  } catch (error) {
    console.warn(`  ⚠ Image download error: ${error instanceof Error ? error.message : url.slice(0, 60)}`);
    return null;
  }
}

/**
 * Import a batch of extracted posts into the SocialPost table.
 * @param posts - Extracted posts (Facebook group, private)
 */
async function importPosts(posts: ExtractedPost[]): Promise<void> {
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
      const hosted = await rehostImage(url);
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
    console.error("Usage: pnpm import:social -- <path-to-json>");
    process.exit(1);
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
  await importPosts(posts);
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
