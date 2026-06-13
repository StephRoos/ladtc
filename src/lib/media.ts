/**
 * Shared media constants and helpers for uploads (gallery, blog).
 *
 * Centralised here so the upload API, the client upload form, and any future
 * consumer agree on accepted types and size limits instead of duplicating
 * (and drifting) the rules.
 */

/** Image MIME types accepted across the app. */
export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** Video MIME types accepted across the app. */
export const VIDEO_MIME_TYPES = ["video/mp4"] as const;

/** Every MIME type accepted by media uploads. */
export const ACCEPTED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES];

/** Comma-separated list for an <input type="file" accept="..."> attribute. */
export const ACCEPT_ATTRIBUTE = ACCEPTED_MIME_TYPES.join(",");

/** Size ceilings per media kind. */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB (Cloudflare free upload ceiling)

/**
 * Media kind stored on GalleryPhoto.mediaType. Mirrors the Prisma `MediaType`
 * enum as a string union so client components don't import the generated client.
 */
export type MediaKind = "IMAGE" | "VIDEO";

/**
 * Classify a MIME type into a media kind.
 * @returns "IMAGE" | "VIDEO", or null if the type is not accepted.
 */
export function mediaKindFromMime(mime: string): MediaKind | null {
  if ((IMAGE_MIME_TYPES as readonly string[]).includes(mime)) return "IMAGE";
  if ((VIDEO_MIME_TYPES as readonly string[]).includes(mime)) return "VIDEO";
  return null;
}

/** Maximum allowed byte size for a given media kind. */
export function maxSizeFor(kind: MediaKind): number {
  return kind === "VIDEO" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
}

/** Human-readable size (e.g. "100 Mo"), for error messages and hints. */
export function formatMaxSize(kind: MediaKind): string {
  return `${maxSizeFor(kind) / (1024 * 1024)} Mo`;
}

interface MediaValidationOk {
  ok: true;
  kind: MediaKind;
}
interface MediaValidationError {
  ok: false;
  status: number;
  error: string;
}

/**
 * Validate an uploaded file's type and size against the per-kind rules.
 * @param file - Type/size of the uploaded file (subset of the File interface)
 * @returns A discriminated result: the kind on success, or an HTTP status + message.
 */
export function validateMediaFile(file: {
  type: string;
  size: number;
}): MediaValidationOk | MediaValidationError {
  const kind = mediaKindFromMime(file.type);
  if (!kind) {
    return {
      ok: false,
      status: 400,
      error: "Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP, GIF, MP4",
    };
  }
  if (file.size > maxSizeFor(kind)) {
    return {
      ok: false,
      status: 400,
      error: `Le fichier dépasse la taille maximale de ${formatMaxSize(kind)}`,
    };
  }
  return { ok: true, kind };
}
