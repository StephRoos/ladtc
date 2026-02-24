/**
 * WordPress REST API integration utilities
 * Fetches editorial content (blog posts, events, media) from the existing WordPress site
 */

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || "https://ladtc.be";
const WP_API_BASE = `${WP_API_URL}/wp-json/wp/v2`;

export interface WordPressBlogPost {
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
  };
  date: string;
  categories?: number[];
  tags?: number[];
}

/**
 * Fetch blog posts from WordPress REST API
 */
export async function fetchBlogPosts(
  page: number = 1,
  perPage: number = 10
): Promise<{
  posts: WordPressBlogPost[];
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
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const posts = await response.json() as WordPressBlogPost[];
    const total = parseInt(response.headers.get("x-wp-total") || "0", 10);
    const totalPages = parseInt(response.headers.get("x-wp-totalpages") || "0", 10);

    return { posts, total, totalPages };
  } catch (error) {
    console.error("Failed to fetch blog posts from WordPress:", error);
    throw error;
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchBlogPostBySlug(slug: string): Promise<WordPressBlogPost | null> {
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

    const posts = await response.json() as WordPressBlogPost[];
    return posts[0] || null;
  } catch (error) {
    console.error(`Failed to fetch blog post with slug "${slug}":`, error);
    throw error;
  }
}

/**
 * Fetch featured image URL for a blog post
 */
export function getFeaturedImageUrl(post: WordPressBlogPost): string | null {
  return (
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    null
  );
}

/**
 * Fetch author name for a blog post
 */
export function getAuthorName(post: WordPressBlogPost): string | null {
  return post._embedded?.author?.[0]?.name || null;
}

/**
 * Strip HTML tags from content
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Decode HTML entities
 */
export function decodeHtmlEntities(html: string): string {
  const element = typeof document !== "undefined" ? document.createElement("div") : null;
  if (element) {
    element.innerHTML = html;
    return element.textContent || "";
  }
  // Fallback for server-side
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
