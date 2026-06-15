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
