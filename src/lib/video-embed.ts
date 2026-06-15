/**
 * Helpers to embed external videos (YouTube / Vimeo) in the gallery without
 * uploading the file — the way around Cloudflare's 100 MB upload ceiling.
 *
 * A gallery item is an external video when its `url` is a recognised YouTube or
 * Vimeo link (stored verbatim in GalleryPhoto.url, mediaType VIDEO). Local
 * uploads keep their `/uploads/...` path and are unaffected.
 */

export interface VideoEmbed {
  provider: "youtube" | "vimeo";
  /** URL to use as an <iframe> src (privacy-friendly nocookie for YouTube). */
  embedUrl: string;
  /** Poster image, or null when the provider needs an API call (Vimeo). */
  thumbnailUrl: string | null;
}

const YOUTUBE_RE =
  /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/;
const VIMEO_RE = /^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/;

/**
 * Parse a YouTube/Vimeo URL into an embed descriptor, or return null when the
 * URL is not a recognised external video (e.g. a local /uploads path).
 */
export function parseVideoEmbed(url: string): VideoEmbed | null {
  const yt = YOUTUBE_RE.exec(url);
  if (yt) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt[1]}`,
      thumbnailUrl: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
    };
  }
  const vm = VIMEO_RE.exec(url);
  if (vm) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vm[1]}`,
      thumbnailUrl: null,
    };
  }
  return null;
}

/** True when the url is an external YouTube/Vimeo video (not a local upload). */
export function isExternalVideo(url: string): boolean {
  return parseVideoEmbed(url) !== null;
}

// Direct (self-hosted) media served from a Nextcloud public share or any HTTPS
// URL ending in a media extension. Videos play in a native <video> element
// (range requests handle streaming); images render with <Image>. The
// "independent" path for heavy media kept on the NAS instead of YouTube.
const VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|avif|heic|heif)(\?.*)?$/i;
// Public share link: capture host (group 1) and token (group 2), ignoring any
// trailing /download the user may have copied.
const NEXTCLOUD_SHARE_RE =
  /^(https:\/\/[^/]+)\/(?:index\.php\/)?s\/([A-Za-z0-9]+)(?:\/download.*)?$/i;
// Already the direct public WebDAV endpoint — accept as-is.
const NEXTCLOUD_DAV_RE = /^https:\/\/[^/]+\/public\.php\/dav\/files\/[A-Za-z0-9]+/i;

/** A self-hosted media link resolved to a directly usable URL plus its kind. */
export interface DirectMedia {
  url: string;
  /** "UNKNOWN" when the URL doesn't reveal the type (Nextcloud share) and a
   *  content-type probe is needed by the caller. */
  kind: "IMAGE" | "VIDEO" | "UNKNOWN";
}

/**
 * Resolve a self-hosted media link (photo or video) into a directly usable URL,
 * or null when the link is not a recognised direct media source.
 *
 * - A Nextcloud public share ("…/s/TOKEN") is rewritten to its public WebDAV
 *   file endpoint ("…/public.php/dav/files/TOKEN") — it streams with HTTP 206
 *   range support, whereas "…/s/TOKEN/download" only 303-redirects there. The
 *   kind is "UNKNOWN" (the URL hides the file type) so the caller probes the
 *   content-type.
 * - An HTTPS URL ending in a known image/video extension keeps its URL and a
 *   resolved kind.
 *
 * HTTPS is required: an http source would be blocked as mixed content.
 */
export function resolveDirectMediaUrl(url: string): DirectMedia | null {
  const trimmed = url.trim();
  if (!/^https:\/\//i.test(trimmed)) return null;
  const nc = NEXTCLOUD_SHARE_RE.exec(trimmed);
  if (nc) return { url: `${nc[1]}/public.php/dav/files/${nc[2]}`, kind: "UNKNOWN" };
  if (NEXTCLOUD_DAV_RE.test(trimmed)) return { url: trimmed, kind: "UNKNOWN" };
  if (VIDEO_EXT_RE.test(trimmed)) return { url: trimmed, kind: "VIDEO" };
  if (IMAGE_EXT_RE.test(trimmed)) return { url: trimmed, kind: "IMAGE" };
  return null;
}
