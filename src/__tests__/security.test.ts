import { describe, it, expect } from "vitest";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { renderBlogContent } from "@/lib/sanitize";

// ─── DOMPurify XSS sanitization ─────────────────────────────────────────────

describe("DOMPurify sanitization for blog content", () => {
  it("strips script tags from HTML", () => {
    const malicious = '<p>Hello</p><script>alert("xss")</script>';
    const clean = DOMPurify.sanitize(malicious);
    expect(clean).not.toContain("<script>");
    expect(clean).toContain("<p>Hello</p>");
  });

  it("strips onerror event handlers", () => {
    const malicious = '<img src="x" onerror="alert(1)">';
    const clean = DOMPurify.sanitize(malicious);
    expect(clean).not.toContain("onerror");
  });

  it("strips javascript: URLs from links", () => {
    const malicious = '<a href="javascript:alert(1)">Click</a>';
    const clean = DOMPurify.sanitize(malicious);
    expect(clean).not.toContain("javascript:");
  });

  it("preserves safe HTML elements", () => {
    const safe = "<h1>Title</h1><p>Some <strong>bold</strong> text</p>";
    const clean = DOMPurify.sanitize(safe);
    expect(clean).toContain("<h1>");
    expect(clean).toContain("<strong>bold</strong>");
  });

  it("sanitizes markdown-rendered content end-to-end", () => {
    const maliciousMarkdown = '# Title\n\n<script>alert("xss")</script>\n\nSafe paragraph.';
    const html = marked.parse(maliciousMarkdown) as string;
    const clean = DOMPurify.sanitize(html);
    expect(clean).toContain("<h1>Title</h1>");
    expect(clean).toContain("Safe paragraph.");
    expect(clean).not.toContain("<script>");
  });

  it("preserves markdown code blocks", () => {
    const markdown = "```js\nconsole.log('hello');\n```";
    const html = marked.parse(markdown) as string;
    const clean = DOMPurify.sanitize(html);
    expect(clean).toContain("<pre>");
    expect(clean).toContain("console.log");
  });
});

// ─── Video embed sanitization ───────────────────────────────────────────────

describe("Video embed support in blog content", () => {
  it("auto-embeds bare YouTube URLs", () => {
    const md = "# Video\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n\nText after.";
    const html = renderBlogContent(md);
    expect(html).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(html).toContain('class="video-embed"');
    expect(html).toContain("Text after.");
  });

  it("auto-embeds youtu.be short URLs", () => {
    const md = "https://youtu.be/dQw4w9WgXcQ";
    const html = renderBlogContent(md);
    expect(html).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("auto-embeds Vimeo URLs", () => {
    const md = "https://vimeo.com/123456789";
    const html = renderBlogContent(md);
    expect(html).toContain("player.vimeo.com/video/123456789");
    expect(html).toContain('class="video-embed"');
  });

  it("preserves trusted iframes in raw HTML", () => {
    const md = '<iframe src="https://www.youtube.com/embed/abc123"></iframe>';
    const html = renderBlogContent(md);
    expect(html).toContain("<iframe");
    expect(html).toContain("youtube.com/embed/abc123");
  });

  it("strips iframes from untrusted domains", () => {
    const md = '<iframe src="https://evil.com/hack"></iframe><p>Safe</p>';
    const html = renderBlogContent(md);
    expect(html).not.toContain("evil.com");
    expect(html).toContain("Safe");
  });

  it("strips iframes with invalid URLs", () => {
    const md = '<iframe src="javascript:alert(1)"></iframe>';
    const html = renderBlogContent(md);
    expect(html).not.toContain("<iframe");
  });

  it("does not embed video URLs inside inline text", () => {
    const md = "Check this out: https://www.youtube.com/watch?v=abc123 in this sentence.";
    const html = renderBlogContent(md);
    // Should be a regular link, not an embed (URL is not on its own line)
    expect(html).not.toContain('class="video-embed"');
  });

  it("strips script tags even with video embeds present", () => {
    const md = 'https://youtu.be/abc123\n\n<script>alert("xss")</script>';
    const html = renderBlogContent(md);
    expect(html).toContain("youtube-nocookie.com/embed/abc123");
    expect(html).not.toContain("<script>");
  });
});

// ─── CSP headers configuration ──────────────────────────────────────────────

describe("CSP headers in next.config", () => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://ladtc.be https:",
    "font-src 'self'",
    "connect-src 'self' https://*.sentry.io",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "frame-ancestors 'none'",
  ];
  const cspValue = cspDirectives.join("; ");

  it("includes default-src self", () => {
    expect(cspValue).toContain("default-src 'self'");
  });

  it("restricts frame-ancestors to none", () => {
    expect(cspValue).toContain("frame-ancestors 'none'");
  });

  it("allows frames from YouTube and Vimeo only", () => {
    expect(cspValue).toContain("frame-src https://www.youtube.com");
    expect(cspValue).toContain("https://www.youtube-nocookie.com");
    expect(cspValue).toContain("https://player.vimeo.com");
  });

  it("allows connections to Sentry for error tracking", () => {
    expect(cspValue).toContain("https://*.sentry.io");
  });

  it("restricts fonts to self only", () => {
    expect(cspValue).toContain("font-src 'self'");
  });
});

// ─── Docker credentials security ────────────────────────────────────────────

describe("docker-compose credential security", () => {
  it("should not contain hardcoded passwords", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("docker-compose.yml", "utf-8");
    // Ensure no hardcoded password values (the old value was "ladtc")
    expect(content).not.toMatch(/POSTGRES_PASSWORD:\s+[a-zA-Z0-9]+\s*$/m);
    expect(content).toContain("${POSTGRES_PASSWORD");
  });

  it("should not contain hardcoded auth secrets", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("docker-compose.yml", "utf-8");
    expect(content).not.toContain("dev-secret-change-in-production");
    expect(content).toContain("${BETTER_AUTH_SECRET");
  });

  it("should use env variable substitution for database URL", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("docker-compose.yml", "utf-8");
    expect(content).toContain("${POSTGRES_USER");
    expect(content).toContain("${POSTGRES_PASSWORD}");
  });
});
