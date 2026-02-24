"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProfileUpdateFormData } from "@/lib/schemas";
import type { User, Membership } from "@/types";

interface MemberProfileResponse {
  user: User;
  membership: Membership | null;
}

/**
 * Fetch current user's profile and membership from the API.
 */
async function fetchMyProfile(): Promise<MemberProfileResponse> {
  const res = await fetch("/api/members/me");
  if (!res.ok) {
    throw new Error("Impossible de charger le profil");
  }
  return res.json() as Promise<MemberProfileResponse>;
}

/**
 * Patch current user's profile via the API.
 */
async function patchMyProfile(data: ProfileUpdateFormData): Promise<MemberProfileResponse> {
  const res = await fetch("/api/members/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de mettre à jour le profil");
  }
  return res.json() as Promise<MemberProfileResponse>;
}

/**
 * Hook to fetch the current user's profile and membership data.
 *
 * @returns TanStack Query result with user and membership
 */
export function useMember(): ReturnType<typeof useQuery<MemberProfileResponse>> {
  return useQuery<MemberProfileResponse>({
    queryKey: ["member", "me"],
    queryFn: fetchMyProfile,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update the current user's profile.
 * Invalidates the member query on success.
 *
 * @returns TanStack Mutation for profile updates
 */
export function useUpdateProfile(): ReturnType<typeof useMutation<MemberProfileResponse, Error, ProfileUpdateFormData>> {
  const queryClient = useQueryClient();

  return useMutation<MemberProfileResponse, Error, ProfileUpdateFormData>({
    mutationFn: patchMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", "me"] });
    },
  });
}
