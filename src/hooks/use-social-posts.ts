"use client";

import { useQuery } from "@tanstack/react-query";

export interface SocialPostItem {
  id: string;
  authorName: string | null;
  content: string;
  mediaUrls: string[];
  permalink: string | null;
  postedAt: string | null;
}

export interface SocialPostsPage {
  posts: SocialPostItem[];
  nextCursor: string | null;
}

/**
 * Fetch one page of club Facebook posts (member wall).
 * @param cursor - Optional id of the last post from the previous page
 */
async function fetchSocialPosts(cursor: string | null): Promise<SocialPostsPage> {
  const url = cursor
    ? `/api/member/social-posts?cursor=${encodeURIComponent(cursor)}`
    : "/api/member/social-posts";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Impossible de charger le fil du club");
  }
  return res.json() as Promise<SocialPostsPage>;
}

/**
 * Hook to fetch the club Facebook wall (authenticated members only).
 * Uses page-based cursor pagination — no polling, staleTime 5 min.
 *
 * @returns TanStack Query result with posts and next cursor
 */
export function useSocialPosts(): ReturnType<typeof useQuery<SocialPostsPage>> {
  return useQuery<SocialPostsPage>({
    queryKey: ["social-posts"],
    queryFn: () => fetchSocialPosts(null),
    staleTime: 5 * 60 * 1000,
  });
}
