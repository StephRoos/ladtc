"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { COMMITTEE_ROLE_SUGGESTIONS } from "@/lib/schemas";

const KEY = "committee.roles";
const STALE_TIME = 30 * 60 * 1000;

/**
 * Fetch the configured committee functions (Président, Trésorier…). Falls
 * back to the bundled suggestions when the setting is unset or the request
 * fails, so the user management dropdown always has a non-empty list.
 */
async function getCommitteeRoles(): Promise<string[]> {
  const res = await fetch(`/api/settings/${KEY}`);
  if (!res.ok) return [...COMMITTEE_ROLE_SUGGESTIONS];
  const data = (await res.json()) as { value: unknown };
  return Array.isArray(data.value) && data.value.length > 0
    ? (data.value as string[])
    : [...COMMITTEE_ROLE_SUGGESTIONS];
}

/** List of committee functions selectable in the user management page. */
export function useCommitteeRoles() {
  return useQuery({
    queryKey: ["committee-roles"],
    queryFn: getCommitteeRoles,
    staleTime: STALE_TIME,
  });
}

/** Update the committee functions list (committee only). */
export function useUpdateCommitteeRoles() {
  const queryClient = useQueryClient();
  return useMutation<string[], Error, string[]>({
    mutationFn: async (roles) => {
      const res = await fetch(`/api/settings/${KEY}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: roles }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Échec de l'enregistrement");
      }
      const data = (await res.json()) as { value: string[] };
      return data.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-roles"] });
    },
  });
}
