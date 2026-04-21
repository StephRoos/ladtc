import DOMPurify from "dompurify";
import { marked, type MarkedExtension } from "marked";

/** Domains allowed for embedded iframes (video players) */
const TRUSTED_IFRAME_HOSTS = [
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
];

/**
 * Regex patterns to detect bare YouTube/Vimeo URLs on their own line.
 * These get auto-converted to responsive iframe embeds before sanitization.
 */
const VIDEO_URL_PATTERNS: { pattern: RegExp; toEmbed: (match: RegExpExecArray) => string }[] = [
  {
    // YouTube: https://www.youtube.com/watch?v=ID or https://youtu.be/ID
    pattern: /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(?:&.*)?$/,
    toEmbed: (m) =>
      `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`,
  },
  {
    // Vimeo: https://vimeo.com/ID
    pattern: /^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/,
    toEmbed: (m) =>
      `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${m[1]}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`,
  },
];

/**
 * Custom marked extension: converts bare video URLs (on their own paragraph)
 * into responsive iframe embeds. Runs before DOMPurify sanitization.
 */
const videoEmbedExtension: MarkedExtension = {
  renderer: {
    paragraph({ tokens }): string | false {
      // Match paragraphs containing a single bare URL (auto-linked by GFM).
      // GFM converts bare URLs to link tokens, so we check for a single
      // link token whose href matches a video URL pattern.
      if (tokens.length === 1 && tokens[0].type === "link") {
        const href = (tokens[0] as { href: string }).href;
        for (const { pattern, toEmbed } of VIDEO_URL_PATTERNS) {
          const match = pattern.exec(href);
          if (match) return toEmbed(match);
        }
      }
      // Also handle raw text (non-GFM or escaped URLs)
      if (tokens.length === 1 && tokens[0].type === "text") {
        const text = tokens[0].raw.trim();
        for (const { pattern, toEmbed } of VIDEO_URL_PATTERNS) {
          const match = pattern.exec(text);
          if (match) return toEmbed(match);
        }
      }
      return false; // fall through to default renderer
    },
  },
};

// Register the extension once
marked.use(videoEmbedExtension);

/**
 * DOMPurify hook: remove iframes pointing to untrusted domains.
 * Called after DOMPurify allows the iframe tag through ADD_TAGS.
 */
function removeUntrustedIframes(node: Element): void {
  if (node.tagName !== "IFRAME") return;
  const src = node.getAttribute("src") || "";
  try {
    const url = new URL(src);
    if (!TRUSTED_IFRAME_HOSTS.includes(url.hostname)) {
      node.remove();
    }
  } catch {
    // Invalid URL — remove the iframe
    node.remove();
  }
}

/**
 * Render Markdown to sanitized HTML with video embed support.
 * Pipeline: Markdown → marked (with video extension) → DOMPurify (iframe allowlist)
 *
 * @param markdown - Raw Markdown content
 * @returns Sanitized HTML string with trusted video iframes preserved
 */
export function renderBlogContent(markdown: string): string {
  const rawHtml = marked.parse(markdown) as string;

  // Allow iframe + its attributes, but filter untrusted sources via hook
  const clean = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "src"],
  });

  // DOMPurify hooks run synchronously during sanitize(), but we need
  // a second pass to filter iframes by domain since hooks can't be
  // registered per-call reliably in a client component.
  const wrapper = document.createElement("div");
  wrapper.innerHTML = clean;
  wrapper.querySelectorAll("iframe").forEach(removeUntrustedIframes);

  return wrapper.innerHTML;
}
