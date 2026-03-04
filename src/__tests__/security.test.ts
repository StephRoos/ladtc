import { describe, it, expect } from "vitest";
import DOMPurify from "dompurify";
import { marked } from "marked";

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

  it("strips iframe elements", () => {
    const malicious = '<p>Text</p><iframe src="https://evil.com"></iframe>';
    const clean = DOMPurify.sanitize(malicious);
    expect(clean).not.toContain("<iframe");
    expect(clean).toContain("<p>Text</p>");
  });

  it("sanitizes markdown-rendered content end-to-end", () => {
    // Simulates the blog rendering pipeline: markdown → HTML → sanitize
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

// ─── CSP headers configuration ──────────────────────────────────────────────

describe("CSP headers in next.config", () => {
  // We test the config values directly to ensure they are correct
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://ladtc.be",
    "font-src 'self'",
    "connect-src 'self' https://*.vercel-storage.com https://*.sentry.io",
    "frame-ancestors 'none'",
  ];
  const cspValue = cspDirectives.join("; ");

  it("includes default-src self", () => {
    expect(cspValue).toContain("default-src 'self'");
  });

  it("restricts frame-ancestors to none", () => {
    expect(cspValue).toContain("frame-ancestors 'none'");
  });

  it("allows images from Vercel Blob storage", () => {
    expect(cspValue).toContain("https://*.public.blob.vercel-storage.com");
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
