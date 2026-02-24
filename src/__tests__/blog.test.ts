import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils";
import { blogPostSchema } from "@/lib/schemas";

describe("blogPostSchema", () => {
  const validPost = {
    title: "Mon premier article",
    slug: "mon-premier-article",
    content: "# Hello World\n\nCeci est un article de test.",
    excerpt: "Un court résumé",
    category: "Trail",
    tags: ["trail", "course"],
    published: false,
  };

  it("validates a correct blog post", () => {
    const result = blogPostSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it("rejects a title that is too short", () => {
    const result = blogPostSchema.safeParse({ ...validPost, title: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty content", () => {
    const result = blogPostSchema.safeParse({ ...validPost, content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid slug", () => {
    const result = blogPostSchema.safeParse({ ...validPost, slug: "Invalid Slug!" });
    expect(result.success).toBe(false);
  });

  it("accepts a slug with numbers and hyphens", () => {
    const result = blogPostSchema.safeParse({ ...validPost, slug: "article-2026-02" });
    expect(result.success).toBe(true);
  });

  it("allows optional fields to be omitted", () => {
    const minimal = {
      title: "Titre minimal",
      slug: "titre-minimal",
      content: "Du contenu.",
    };
    const result = blogPostSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid featured image URL", () => {
    const result = blogPostSchema.safeParse({
      ...validPost,
      featuredImageUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an empty string for featured image URL", () => {
    const result = blogPostSchema.safeParse({
      ...validPost,
      featuredImageUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("validates partial schema for updates", () => {
    const partial = blogPostSchema.partial();
    const result = partial.safeParse({ title: "Nouveau titre" });
    expect(result.success).toBe(true);
  });
});

describe("slugify for blog posts", () => {
  it("converts title to a valid slug", () => {
    expect(slugify("Mon premier article")).toBe("mon-premier-article");
  });

  it("handles accented characters", () => {
    expect(slugify("Résumé de la compétition")).toBe("resume-de-la-competition");
  });

  it("removes special characters", () => {
    expect(slugify("Trail & Course: 2026!")).toBe("trail-course-2026");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
});
