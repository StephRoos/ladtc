"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { BlogPost } from "@/types";
import type { BlogPostFormData } from "@/lib/schemas";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  totalPages: number;
}

interface BlogPostResponse {
  post: BlogPost;
}

interface AdminBlogPostsResponse {
  posts: BlogPost[];
}

/**
 * Fetch published blog posts from the public API
 * @param page - Page number
 * @param perPage - Posts per page
 */
async function getBlogPosts(
  page: number,
  perPage: number
): Promise<BlogPostsResponse> {
  const res = await fetch(
    `/api/blog/posts?page=${page}&per_page=${perPage}`
  );
  if (!res.ok) {
    throw new Error("Impossible de charger les articles");
  }
  return res.json() as Promise<BlogPostsResponse>;
}

/**
 * Fetch a single published blog post by slug
 * @param slug - Post slug
 */
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`/api/blog/posts/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("Impossible de charger l'article");
  }
  return res.json() as Promise<BlogPost | null>;
}

/**
 * Fetch all blog posts (including drafts) from the admin API
 */
async function getAdminBlogPosts(): Promise<AdminBlogPostsResponse> {
  const res = await fetch("/api/admin/blog/posts");
  if (!res.ok) {
    throw new Error("Impossible de charger les articles");
  }
  return res.json() as Promise<AdminBlogPostsResponse>;
}

/**
 * Fetch a single blog post by ID from the admin API
 */
async function getAdminBlogPost(id: string): Promise<BlogPostResponse> {
  const res = await fetch(`/api/admin/blog/posts/${id}`);
  if (!res.ok) {
    throw new Error("Article introuvable");
  }
  return res.json() as Promise<BlogPostResponse>;
}

/**
 * Create a new blog post (admin only)
 */
async function createBlogPost(data: BlogPostFormData): Promise<BlogPostResponse> {
  const res = await fetch("/api/admin/blog/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de créer l'article");
  }
  return res.json() as Promise<BlogPostResponse>;
}

/**
 * Update an existing blog post (admin only)
 */
async function updateBlogPost(
  id: string,
  data: Partial<BlogPostFormData>
): Promise<BlogPostResponse> {
  const res = await fetch(`/api/admin/blog/posts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de mettre à jour l'article");
  }
  return res.json() as Promise<BlogPostResponse>;
}

/**
 * Delete a blog post (admin only)
 */
async function deleteBlogPost(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/admin/blog/posts/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de supprimer l'article");
  }
  return res.json() as Promise<{ success: boolean }>;
}

/**
 * TanStack Query hook for paginated published blog posts
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
 * TanStack Query hook for a single published blog post
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

/**
 * TanStack Query hook for all blog posts (admin, including drafts)
 */
export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: getAdminBlogPosts,
    staleTime: STALE_TIME,
  });
}

/**
 * TanStack Query hook for a single blog post by ID (admin)
 * @param id - Post ID
 */
export function useAdminBlogPost(id: string) {
  return useQuery({
    queryKey: ["admin-blog-post", id],
    queryFn: () => getAdminBlogPost(id),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook to create a new blog post
 */
export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation<BlogPostResponse, Error, BlogPostFormData>({
    mutationFn: createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

/**
 * Hook to update an existing blog post
 */
export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation<
    BlogPostResponse,
    Error,
    { id: string; data: Partial<BlogPostFormData> }
  >({
    mutationFn: ({ id, data }) => updateBlogPost(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-post", id] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

/**
 * Hook to delete a blog post
 */
export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}
