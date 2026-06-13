import { describe, it, expect } from "vitest";
import {
  mediaKindFromMime,
  maxSizeFor,
  validateMediaFile,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  ACCEPTED_MIME_TYPES,
} from "@/lib/media";

// ─── Media classification ────────────────────────────────────────────────────

describe("mediaKindFromMime", () => {
  it("classifies image MIME types as IMAGE", () => {
    expect(mediaKindFromMime("image/jpeg")).toBe("IMAGE");
    expect(mediaKindFromMime("image/png")).toBe("IMAGE");
    expect(mediaKindFromMime("image/webp")).toBe("IMAGE");
    expect(mediaKindFromMime("image/gif")).toBe("IMAGE");
  });

  it("classifies mp4 as VIDEO", () => {
    expect(mediaKindFromMime("video/mp4")).toBe("VIDEO");
  });

  it("returns null for unsupported types", () => {
    expect(mediaKindFromMime("video/quicktime")).toBeNull();
    expect(mediaKindFromMime("application/pdf")).toBeNull();
    expect(mediaKindFromMime("text/html")).toBeNull();
    expect(mediaKindFromMime("")).toBeNull();
  });
});

describe("maxSizeFor", () => {
  it("uses the image ceiling for images and the video ceiling for videos", () => {
    expect(maxSizeFor("IMAGE")).toBe(MAX_IMAGE_SIZE);
    expect(maxSizeFor("VIDEO")).toBe(MAX_VIDEO_SIZE);
  });

  it("allows videos much larger than images", () => {
    expect(MAX_VIDEO_SIZE).toBeGreaterThan(MAX_IMAGE_SIZE);
  });
});

// ─── Upload validation ───────────────────────────────────────────────────────

describe("validateMediaFile", () => {
  it("accepts a small image", () => {
    const res = validateMediaFile({ type: "image/png", size: 1_000_000 });
    expect(res).toEqual({ ok: true, kind: "IMAGE" });
  });

  it("accepts an mp4 under the video ceiling", () => {
    const res = validateMediaFile({ type: "video/mp4", size: 50 * 1024 * 1024 });
    expect(res).toEqual({ ok: true, kind: "VIDEO" });
  });

  it("rejects an unsupported type", () => {
    const res = validateMediaFile({ type: "video/quicktime", size: 1000 });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.status).toBe(400);
      expect(res.error).toContain("MP4");
    }
  });

  it("rejects an image over 5 MB", () => {
    const res = validateMediaFile({ type: "image/jpeg", size: MAX_IMAGE_SIZE + 1 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("5 Mo");
  });

  it("rejects a video over 100 MB", () => {
    const res = validateMediaFile({ type: "video/mp4", size: MAX_VIDEO_SIZE + 1 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("100 Mo");
  });

  it("accepts a video that would be rejected as an image (size between limits)", () => {
    // 20 MB: over the image ceiling, under the video ceiling
    const size = 20 * 1024 * 1024;
    expect(validateMediaFile({ type: "image/png", size }).ok).toBe(false);
    expect(validateMediaFile({ type: "video/mp4", size }).ok).toBe(true);
  });
});

describe("ACCEPTED_MIME_TYPES", () => {
  it("includes the four image types and mp4", () => {
    expect(ACCEPTED_MIME_TYPES).toContain("image/jpeg");
    expect(ACCEPTED_MIME_TYPES).toContain("video/mp4");
    expect(ACCEPTED_MIME_TYPES).toHaveLength(5);
  });
});
