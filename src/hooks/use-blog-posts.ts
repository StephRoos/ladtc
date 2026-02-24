"use client";

import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@/types";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  totalPages: number;
}

/**
 * Fetch blog posts from the internal API proxy
 * @param page - Page number
 * @param perPage - Posts per page
 */
async function getBlogPosts(
  page: number,
  perPage: number
): Promise<BlogPostsResponse> {
  const res = await fetch(
    `/api/wordpress/posts?page=${page}&per_page=${perPage}`
  );
  if (!res.ok) {
    throw new Error("Impossible de charger les articles");
  }
  return res.json() as Promise<BlogPostsResponse>;
}

/**
 * Fetch a single blog post by slug from the internal API proxy
 * @param slug - Post slug
 */
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`/api/wordpress/posts/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("Impossible de charger l'article");
  }
  return res.json() as Promise<BlogPost | null>;
}

/**
 * TanStack Query hook for paginated blog posts list
 * @param page - Page number (default: 1)
 * @param perPage - Posts per page (default: 10)
 */
export function useBlogPosts(page: number = 1, perPage: number = 10) {
  return useQuery({
    queryKey: ["blog-posts", page, perPage],
    queryFn: () => getBlogPosts(page, perPage),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * TanStack Query hook for a single blog post
 * @param slug - Post slug
 */
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => getBlogPost(slug),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: Boolean(slug),
  });
}
