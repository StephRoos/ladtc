import { describe, it, expect } from "vitest";
import { cn, formatDate, formatCurrency, slugify, truncate, isValidEmail } from "@/lib/utils";

// ─── cn (class merging) ──────────────────────────────────────────────────────

describe("cn", () => {
  it("merges two class strings", () => {
    expect(cn("p-4", "m-2")).toBe("p-4 m-2");
  });

  it("resolves conflicting Tailwind classes (last wins)", () => {
    const result = cn("p-4", "p-8");
    expect(result).toBe("p-8");
  });

  it("handles conditional classes via clsx syntax", () => {
    const result = cn("base", false && "hidden", "visible");
    expect(result).toBe("base visible");
  });

  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });
});

// ─── formatDate ──────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("formats a Date object in French locale", () => {
    const result = formatDate(new Date("2026-03-04"));
    expect(result).toContain("mars");
    expect(result).toContain("2026");
  });

  it("formats a date string in French locale", () => {
    const result = formatDate("2025-12-25");
    expect(result).toContain("décembre");
    expect(result).toContain("2025");
  });

  it("formats ISO string with time", () => {
    const result = formatDate("2026-01-15T10:30:00.000Z");
    expect(result).toContain("janvier");
    expect(result).toContain("2026");
  });
});

// ─── formatCurrency ──────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  it("formats EUR amount in French locale", () => {
    const result = formatCurrency(25.5);
    // French locale uses "25,50 €" or similar
    expect(result).toContain("25,50");
    expect(result).toContain("€");
  });

  it("formats zero amount", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0,00");
  });

  it("accepts custom currency", () => {
    const result = formatCurrency(100, "USD");
    expect(result).toContain("$");
  });
});

// ─── slugify ─────────────────────────────────────────────────────────────────

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes accents from French text", () => {
    expect(slugify("Événement spécial")).toBe("evenement-special");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! @World #2026")).toBe("hello-world-2026");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("a   b---c")).toBe("a-b-c");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--test--")).toBe("test");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

// ─── truncate ────────────────────────────────────────────────────────────────

describe("truncate", () => {
  it("returns original text if shorter than limit", () => {
    expect(truncate("short", 10)).toBe("short");
  });

  it("truncates long text and adds ellipsis", () => {
    expect(truncate("This is a long text", 10)).toBe("This is a...");
  });

  it("returns exact text when equal to limit", () => {
    expect(truncate("exact", 5)).toBe("exact");
  });
});

// ─── isValidEmail ────────────────────────────────────────────────────────────

describe("isValidEmail", () => {
  it("accepts valid email", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  it("rejects email without @", () => {
    expect(isValidEmail("testexample.com")).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(isValidEmail("test@")).toBe(false);
  });

  it("rejects email with spaces", () => {
    expect(isValidEmail("te st@example.com")).toBe(false);
  });

  it("accepts email with subdomains", () => {
    expect(isValidEmail("user@mail.example.co.uk")).toBe(true);
  });
});
