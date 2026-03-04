import { describe, it, expect } from "vitest";
import {
  orderUpdateSchema,
  blogPostSchema,
  eventSchema,
  BLOG_CATEGORIES,
  CATEGORY_TO_EVENT_TYPE,
  EVENT_CATEGORIES,
  COMMITTEE_ROLE_SUGGESTIONS,
} from "@/lib/schemas";

// ─── orderUpdateSchema ──────────────────────────────────────────────────────

describe("orderUpdateSchema", () => {
  it("accepts valid order status update", () => {
    const result = orderUpdateSchema.safeParse({
      status: "SHIPPED",
      trackingNumber: "TRK123456",
      notes: "Expédié via Bpost",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal update with only status", () => {
    const result = orderUpdateSchema.safeParse({ status: "CONFIRMED" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = orderUpdateSchema.safeParse({ status: "REFUNDED" });
    expect(result.success).toBe(false);
  });

  it("validates all valid order statuses", () => {
    const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
    for (const status of statuses) {
      const result = orderUpdateSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it("accepts empty tracking number string", () => {
    const result = orderUpdateSchema.safeParse({
      status: "SHIPPED",
      trackingNumber: "",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Blog categories & event type mapping ───────────────────────────────────

describe("blog categories configuration", () => {
  it("defines 5 blog categories", () => {
    expect(BLOG_CATEGORIES).toHaveLength(5);
  });

  it("includes expected categories", () => {
    expect(BLOG_CATEGORIES).toContain("Actualité");
    expect(BLOG_CATEGORIES).toContain("Stage");
    expect(BLOG_CATEGORIES).toContain("Course");
    expect(BLOG_CATEGORIES).toContain("Entraînement");
    expect(BLOG_CATEGORIES).toContain("Social");
  });

  it("maps 'Actualité' to null (not event-related)", () => {
    expect(CATEGORY_TO_EVENT_TYPE["Actualité"]).toBeNull();
  });

  it("maps event categories to correct EventType", () => {
    expect(CATEGORY_TO_EVENT_TYPE["Stage"]).toBe("CAMP");
    expect(CATEGORY_TO_EVENT_TYPE["Course"]).toBe("RACE");
    expect(CATEGORY_TO_EVENT_TYPE["Entraînement"]).toBe("TRAINING");
    expect(CATEGORY_TO_EVENT_TYPE["Social"]).toBe("SOCIAL");
  });

  it("EVENT_CATEGORIES excludes non-event categories", () => {
    expect(EVENT_CATEGORIES).not.toContain("Actualité");
    expect(EVENT_CATEGORIES).toHaveLength(4);
  });
});

// ─── Committee role suggestions ─────────────────────────────────────────────

describe("committee role suggestions", () => {
  it("provides standard committee roles", () => {
    expect(COMMITTEE_ROLE_SUGGESTIONS).toContain("Président");
    expect(COMMITTEE_ROLE_SUGGESTIONS).toContain("Trésorier");
    expect(COMMITTEE_ROLE_SUGGESTIONS).toContain("Secrétaire");
  });

  it("has at least 5 suggestions", () => {
    expect(COMMITTEE_ROLE_SUGGESTIONS.length).toBeGreaterThanOrEqual(5);
  });
});

// ─── blogPostSchema edge cases ──────────────────────────────────────────────

describe("blogPostSchema edge cases", () => {
  it("accepts blog post with event fields (eventDate + eventLocation)", () => {
    const result = blogPostSchema.safeParse({
      title: "Course de trail",
      slug: "course-de-trail",
      content: "Détails de la course.",
      category: "Course",
      eventDate: "2026-05-15T09:00",
      eventLocation: "Flobecq",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null eventDate", () => {
    const result = blogPostSchema.safeParse({
      title: "Actualité club",
      slug: "actualite-club",
      content: "Nouvelles du club.",
      eventDate: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects eventDate with invalid format", () => {
    const result = blogPostSchema.safeParse({
      title: "Test",
      slug: "test",
      content: "Content.",
      eventDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("accepts local image path for featuredImageUrl", () => {
    const result = blogPostSchema.safeParse({
      title: "Test",
      slug: "test",
      content: "Content.",
      featuredImageUrl: "/images/hero.jpg",
    });
    expect(result.success).toBe(true);
  });
});

// ─── eventSchema edge cases ─────────────────────────────────────────────────

describe("eventSchema edge cases", () => {
  it("rejects empty string for image (not a valid URL or path)", () => {
    const result = eventSchema.safeParse({
      title: "Course",
      date: "2026-04-01T08:00",
      location: "Renaix",
      type: "RACE",
      image: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts event with all optional fields", () => {
    const result = eventSchema.safeParse({
      title: "Stage complet",
      description: "Un stage de trail en montagne",
      date: "2026-06-01T08:00",
      endDate: "2026-06-03T17:00",
      location: "Chamonix",
      type: "CAMP",
      difficulty: "Difficile",
      maxParticipants: 25,
      image: "https://example.com/camp.jpg",
    });
    expect(result.success).toBe(true);
  });
});
