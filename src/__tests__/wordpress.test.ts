import { describe, it, expect } from "vitest";
import {
  normalizeBlogPost,
  stripHtmlTags,
  decodeHtmlEntities,
  type WordPressRawPost,
} from "@/lib/wordpress";

const mockRawPost: WordPressRawPost = {
  id: 42,
  title: { rendered: "New Training Route" },
  slug: "new-training-route",
  content: { rendered: "<p>Today we explored a new trail.</p>" },
  excerpt: { rendered: "<p>Today we explored...</p>" },
  featured_media: 123,
  date: "2026-02-20T10:30:00",
  categories: [1],
  tags: [5],
  _embedded: {
    "wp:featuredmedia": [
      {
        source_url: "https://ladtc.be/media/route.jpg",
        alt_text: "Trail route map",
      },
    ],
    author: [{ id: 1, name: "Jean Dupont" }],
    "wp:term": [
      [{ id: 1, name: "Trail", taxonomy: "category" }],
      [{ id: 5, name: "Formation", taxonomy: "post_tag" }],
    ],
  },
};

describe("normalizeBlogPost", () => {
  it("returns a BlogPost with camelCase fields", () => {
    const post = normalizeBlogPost(mockRawPost);

    expect(post.id).toBe(42);
    expect(post.title).toBe("New Training Route");
    expect(post.slug).toBe("new-training-route");
    expect(post.featuredImageUrl).toBe("https://ladtc.be/media/route.jpg");
    expect(post.author.name).toBe("Jean Dupont");
    expect(post.publishedDate).toBe("2026-02-20T10:30:00");
    expect(post.categories).toHaveLength(1);
    expect(post.categories[0].name).toBe("Trail");
    expect(post.tags[0].name).toBe("Formation");
  });

  it("returns null featuredImageUrl when no media", () => {
    const postWithoutMedia: WordPressRawPost = {
      ...mockRawPost,
      featured_media: 0,
      _embedded: { author: [{ id: 1, name: "Jean Dupont" }] },
    };
    const post = normalizeBlogPost(postWithoutMedia);
    expect(post.featuredImageUrl).toBeNull();
  });

  it("falls back to LADTC as author when no author embedded", () => {
    const postWithoutAuthor: WordPressRawPost = {
      ...mockRawPost,
      _embedded: {},
    };
    const post = normalizeBlogPost(postWithoutAuthor);
    expect(post.author.name).toBe("la dtc");
  });
});

describe("stripHtmlTags", () => {
  it("removes HTML tags from a string", () => {
    expect(stripHtmlTags("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world"
    );
  });

  it("returns plain text unchanged", () => {
    expect(stripHtmlTags("No tags here")).toBe("No tags here");
  });
});

describe("decodeHtmlEntities", () => {
  it("decodes common HTML entities", () => {
    expect(decodeHtmlEntities("&amp;")).toBe("&");
    expect(decodeHtmlEntities("&lt;div&gt;")).toBe("<div>");
    expect(decodeHtmlEntities("&quot;quoted&quot;")).toBe('"quoted"');
  });
});
