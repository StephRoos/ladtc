import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { join, normalize, sep } from "path";
import { Readable } from "stream";
import type { NextRequest } from "next/server";

/**
 * Serves files uploaded at runtime (Docker volume).
 *
 * Next.js only serves `public/` assets present at build time — files written
 * after the build (admin uploads, scp'd videos) are invisible to the static
 * handler and would 404. This route streams them from disk instead, with
 * HTTP Range support so <video> seeking works.
 */

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

/** Allowed extensions → Content-Type. Anything else 404s. */
const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  pdf: "application/pdf",
};

interface ResolvedFile {
  filePath: string;
  mimeType: string;
  size: number;
}

/**
 * Resolve and validate a requested upload path.
 * Returns null when the path escapes UPLOAD_DIR (traversal), has a
 * disallowed extension, or does not exist on disk.
 */
async function resolveUpload(segments: string[]): Promise<ResolvedFile | null> {
  const filePath = normalize(join(UPLOAD_DIR, ...segments));

  // Path traversal guard: the resolved path must stay inside UPLOAD_DIR
  if (!filePath.startsWith(UPLOAD_DIR + sep)) return null;

  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = MIME_TYPES[ext];
  if (!mimeType) return null;

  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) return null;
    return { filePath, mimeType, size: stats.size };
  } catch {
    return null; // missing file
  }
}

/** Common headers for both full and partial responses. */
function baseHeaders(file: ResolvedFile): Record<string, string> {
  return {
    "Content-Type": file.mimeType,
    "Accept-Ranges": "bytes",
    // Uploaded filenames are content-addressed (UUID) — safe to cache hard
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await params;
  const file = await resolveUpload(path);
  if (!file) return new Response("Not found", { status: 404 });

  const range = request.headers.get("range");

  // Partial content (video seeking, resumed downloads)
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (match[1] === "" && match[2] === "")) {
      return new Response("Invalid range", { status: 416 });
    }
    const start = match[1] === "" ? Math.max(0, file.size - Number(match[2])) : Number(match[1]);
    const end = match[1] !== "" && match[2] !== "" ? Number(match[2]) : file.size - 1;

    if (start >= file.size || end >= file.size || start > end) {
      return new Response("Range not satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${file.size}` },
      });
    }

    const stream = Readable.toWeb(
      createReadStream(file.filePath, { start, end })
    ) as ReadableStream;

    return new Response(stream, {
      status: 206,
      headers: {
        ...baseHeaders(file),
        "Content-Range": `bytes ${start}-${end}/${file.size}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  // Full file
  const stream = Readable.toWeb(createReadStream(file.filePath)) as ReadableStream;
  return new Response(stream, {
    status: 200,
    headers: { ...baseHeaders(file), "Content-Length": String(file.size) },
  });
}

export async function HEAD(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await ctx.params;
  const file = await resolveUpload(path);
  if (!file) return new Response(null, { status: 404 });

  return new Response(null, {
    status: 200,
    headers: { ...baseHeaders(file), "Content-Length": String(file.size) },
  });
}
