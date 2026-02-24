/**
 * WordPress REST API integration utilities
 * Fetches editorial content (blog posts, events, media) from the existing WordPress site
 */

import type { BlogPost } from "@/types";

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || "https://ladtc.be";
const WP_API_BASE = `${WP_API_URL}/wp-json/wp/v2`;

/** Raw WordPress REST API post shape */
export interface WordPressRawPost {
  id: number;
  title: {
    rendered: string;
  };
  slug: string;
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    author?: Array<{
      id: number;
      name: string;
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        taxonomy: string;
      }>
    >;
  };
  date: string;
  categories?: number[];
  tags?: number[];
}

/**
 * Normalize a raw WordPress post to the BlogPost type
 * @param raw - Raw WordPress API post
 * @returns Normalized BlogPost in camelCase
 */
export function normalizeBlogPost(raw: WordPressRawPost): BlogPost {
  const featuredImageUrl =
    raw._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;

  const author = raw._embedded?.author?.[0]
    ? { id: raw._embedded.author[0].id, name: raw._embedded.author[0].name }
    : { id: 0, name: "la dtc" };

  const terms = raw._embedded?.["wp:term"] ?? [];
  const categories = (terms[0] ?? [])
    .filter((t) => t.taxonomy === "category")
    .map((t) => ({ id: t.id, name: t.name }));
  const tags = (terms[1] ?? [])
    .filter((t) => t.taxonomy === "post_tag")
    .map((t) => ({ id: t.id, name: t.name }));

  return {
    id: raw.id,
    title: decodeHtmlEntities(raw.title.rendered),
    slug: raw.slug,
    content: raw.content.rendered,
    excerpt: stripHtmlTags(decodeHtmlEntities(raw.excerpt.rendered)),
    featuredImageUrl,
    author,
    publishedDate: raw.date,
    categories,
    tags,
  };
}

/**
 * Fetch blog posts from WordPress REST API
 * @param page - Page number (1-indexed)
 * @param perPage - Number of posts per page
 * @returns Paginated blog posts with total counts
 */
export async function fetchBlogPosts(
  page: number = 1,
  perPage: number = 10
): Promise<{
  posts: BlogPost[];
  total: number;
  totalPages: number;
}> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      _embed: "true",
    });

    const response = await fetch(`${WP_API_BASE}/posts?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const rawPosts = (await response.json()) as WordPressRawPost[];
    const total = parseInt(response.headers.get("x-wp-total") ?? "0", 10);
    const totalPages = parseInt(
      response.headers.get("x-wp-totalpages") ?? "0",
      10
    );

    return {
      posts: rawPosts.map(normalizeBlogPost),
      total,
      totalPages,
    };
  } catch (error) {
    console.error("Failed to fetch blog posts from WordPress:", error);
    throw error;
  }
}

/**
 * Fetch a single blog post by slug
 * @param slug - The post slug
 * @returns Normalized BlogPost or null if not found
 */
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const params = new URLSearchParams({
      slug,
      _embed: "true",
    });

    const response = await fetch(`${WP_API_BASE}/posts?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const rawPosts = (await response.json()) as WordPressRawPost[];
    if (!rawPosts[0]) return null;

    return normalizeBlogPost(rawPosts[0]);
  } catch (error) {
    console.error(`Failed to fetch blog post with slug "${slug}":`, error);
    throw error;
  }
}

/**
 * Strip HTML tags from a string
 * @param html - HTML string to strip
 * @returns Plain text string
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Decode HTML entities (server-safe)
 * @param html - HTML string with entities
 * @returns String with decoded entities
 */
export function decodeHtmlEntities(html: string): string {
  if (typeof document !== "undefined") {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.textContent ?? "";
  }
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
