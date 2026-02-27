"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MemberUpdateFormData, MemberCreateFormData } from "@/lib/schemas";
import type { User, Membership, MemberStats } from "@/types";

export interface MembersFilters {
  status?: string;
  search?: string;
  sort?: string;
  page?: number;
}

interface MembersListResponse {
  members: (User & { membership: Membership | null })[];
  total: number;
  pages: number;
  page: number;
}

interface MemberDetailResponse {
  user: User;
  membership: Membership | null;
}

/**
 * Fetch all members from the API with optional filters.
 */
async function fetchMembers(filters: MembersFilters): Promise<MembersListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));

  const res = await fetch(`/api/members?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Impossible de charger les membres");
  }
  return res.json() as Promise<MembersListResponse>;
}

/**
 * Patch a specific member's membership via the API.
 */
async function patchMember(
  id: string,
  data: MemberUpdateFormData
): Promise<MemberDetailResponse> {
  const res = await fetch(`/api/members/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de mettre à jour le membre");
  }
  return res.json() as Promise<MemberDetailResponse>;
}

/**
 * Fetch member stats from the API.
 */
async function fetchMemberStats(): Promise<MemberStats> {
  const res = await fetch("/api/admin/members/stats");
  if (!res.ok) {
    throw new Error("Impossible de charger les statistiques");
  }
  return res.json() as Promise<MemberStats>;
}

/**
 * Hook to fetch the full members list with filters.
 *
 * @param filters - Optional status, search, sort, and page filters
 * @returns TanStack Query result with paginated members
 */
export function useMembers(
  filters: MembersFilters = {}
): ReturnType<typeof useQuery<MembersListResponse>> {
  return useQuery<MembersListResponse>({
    queryKey: ["members", filters],
    queryFn: () => fetchMembers(filters),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to update a specific member's membership data.
 * Invalidates the members list on success.
 *
 * @returns TanStack Mutation for member updates
 */
export function useUpdateMember(): ReturnType<
  typeof useMutation<MemberDetailResponse, Error, { id: string; data: MemberUpdateFormData }>
> {
  const queryClient = useQueryClient();

  return useMutation<MemberDetailResponse, Error, { id: string; data: MemberUpdateFormData }>({
    mutationFn: ({ id, data }) => patchMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member-stats"] });
    },
  });
}

/**
 * Create a new member via the admin API.
 */
async function createMember(data: MemberCreateFormData): Promise<MemberDetailResponse> {
  const res = await fetch("/api/admin/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let message = "Impossible de créer le membre";
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) message = err.error;
    } catch {}
    throw new Error(message);
  }
  return res.json() as Promise<MemberDetailResponse>;
}

/**
 * Hook to create a new member (user + membership).
 * Invalidates members list and stats on success.
 *
 * @returns TanStack Mutation for member creation
 */
export function useCreateMember(): ReturnType<
  typeof useMutation<MemberDetailResponse, Error, MemberCreateFormData>
> {
  const queryClient = useQueryClient();

  return useMutation<MemberDetailResponse, Error, MemberCreateFormData>({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member-stats"] });
    },
  });
}

/**
 * Hook to fetch membership statistics for the admin dashboard.
 *
 * @returns TanStack Query result with member stats
 */
export function useMemberStats(): ReturnType<typeof useQuery<MemberStats>> {
  return useQuery<MemberStats>({
    queryKey: ["member-stats"],
    queryFn: fetchMemberStats,
    staleTime: 5 * 60 * 1000,
  });
}
