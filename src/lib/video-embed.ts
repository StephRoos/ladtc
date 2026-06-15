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

// Direct (self-hosted) video files served from a Nextcloud public share or any
// HTTPS URL ending in a video extension. These play in a native <video> element
// (range requests handle streaming) — the "independent" path for heavy videos
// kept on the NAS instead of YouTube.
const VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;
const NEXTCLOUD_SHARE_RE =
  /^(https:\/\/[^/]+\/(?:index\.php\/)?s\/[A-Za-z0-9]+)(\/download.*)?$/;

/**
 * Resolve a self-hosted video link into a directly playable URL, or null when
 * the link is not a recognised direct video.
 *
 * - A Nextcloud public share ("…/s/TOKEN") is normalised to its file endpoint
 *   ("…/s/TOKEN/download") so it streams in a <video> tag.
 * - Any HTTPS URL ending in a video extension is taken as-is.
 *
 * HTTPS is required: an http source would be blocked as mixed content on the
 * site.
 */
export function resolveDirectVideoUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!/^https:\/\//i.test(trimmed)) return null;
  const nc = NEXTCLOUD_SHARE_RE.exec(trimmed);
  if (nc) return nc[2] ? trimmed : `${nc[1]}/download`;
  if (VIDEO_EXT_RE.test(trimmed)) return trimmed;
  return null;
}
