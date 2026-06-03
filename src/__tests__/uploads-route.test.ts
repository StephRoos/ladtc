import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";
import { GET, HEAD } from "@/app/uploads/[...path]/route";

// ─── Runtime uploads route handler ──────────────────────────────────────────

const TEST_DIR = join(process.cwd(), "public", "uploads", "__test__");
const TEST_CONTENT = "0123456789abcdef"; // 16 bytes — easy range math

function makeParams(segments: string[]): { params: Promise<{ path: string[] }> } {
  return { params: Promise.resolve({ path: segments }) };
}

function makeRequest(range?: string): NextRequest {
  return new NextRequest("http://localhost/uploads/__test__/file.mp4", {
    headers: range ? { range } : undefined,
  });
}

describe("Uploads route handler (runtime files)", () => {
  beforeAll(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(join(TEST_DIR, "file.mp4"), TEST_CONTENT);
    await writeFile(join(TEST_DIR, "script.sh"), "#!/bin/sh");
  });

  afterAll(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("serves an existing file with correct headers", async () => {
    const res = await GET(makeRequest(), makeParams(["__test__", "file.mp4"]));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("video/mp4");
    expect(res.headers.get("Accept-Ranges")).toBe("bytes");
    expect(res.headers.get("Content-Length")).toBe(String(TEST_CONTENT.length));
    expect(await res.text()).toBe(TEST_CONTENT);
  });

  it("returns 404 for a missing file", async () => {
    const res = await GET(makeRequest(), makeParams(["__test__", "nope.mp4"]));
    expect(res.status).toBe(404);
  });

  it("returns 404 for a disallowed extension", async () => {
    const res = await GET(makeRequest(), makeParams(["__test__", "script.sh"]));
    expect(res.status).toBe(404);
  });

  it("blocks path traversal outside the uploads directory", async () => {
    const res = await GET(makeRequest(), makeParams(["..", "..", "package.json"]));
    expect(res.status).toBe(404);
  });

  it("serves partial content for a valid Range request", async () => {
    const res = await GET(makeRequest("bytes=0-3"), makeParams(["__test__", "file.mp4"]));
    expect(res.status).toBe(206);
    expect(res.headers.get("Content-Range")).toBe(`bytes 0-3/${TEST_CONTENT.length}`);
    expect(res.headers.get("Content-Length")).toBe("4");
    expect(await res.text()).toBe("0123");
  });

  it("serves an open-ended Range to end of file", async () => {
    const res = await GET(makeRequest("bytes=10-"), makeParams(["__test__", "file.mp4"]));
    expect(res.status).toBe(206);
    expect(await res.text()).toBe("abcdef");
  });

  it("returns 416 for an out-of-bounds Range", async () => {
    const res = await GET(makeRequest("bytes=100-200"), makeParams(["__test__", "file.mp4"]));
    expect(res.status).toBe(416);
    expect(res.headers.get("Content-Range")).toBe(`bytes */${TEST_CONTENT.length}`);
  });

  it("answers HEAD with headers and no body", async () => {
    const res = await HEAD(makeRequest(), makeParams(["__test__", "file.mp4"]));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Length")).toBe(String(TEST_CONTENT.length));
    expect(res.body).toBeNull();
  });
});
