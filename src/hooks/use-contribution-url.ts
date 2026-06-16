"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = "site.contributionUrl";
const STALE_TIME = 30 * 60 * 1000; // 30 minutes — changes rarely

/**
 * Public read of the members' contribution link (Nextcloud file-drop). Returns
 * the URL string, or null when unset (the public upload button stays hidden).
 */
async function getContributionUrl(): Promise<string | null> {
  const res = await fetch(`/api/settings/${KEY}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { value: unknown };
  return typeof data.value === "string" && data.value.length > 0 ? data.value : null;
}

export function useContributionUrl() {
  return useQuery({
    queryKey: ["contribution-url"],
    queryFn: getContributionUrl,
    staleTime: STALE_TIME,
  });
}

/** Update the contribution link (committee only) and refresh the public read. */
export function useUpdateContributionUrl() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: async (url) => {
      const res = await fetch(`/api/settings/${KEY}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: url }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Échec de l'enregistrement");
      }
      const data = (await res.json()) as { value: string };
      return data.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contribution-url"] });
    },
  });
}
