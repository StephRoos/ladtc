"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_DTC_MEANINGS } from "@/config/site";

const KEY = "site.dtcMeanings";
const STALE_TIME = 30 * 60 * 1000; // 30 minutes — subtitles change rarely

/**
 * Fetch the configured "la dtc" subtitles. Falls back to the bundled defaults
 * when the setting is unset or the request fails, so the header always has a
 * non-empty list to pick from.
 */
async function getMeanings(): Promise<string[]> {
  const res = await fetch(`/api/settings/${KEY}`);
  if (!res.ok) return DEFAULT_DTC_MEANINGS;
  const data = (await res.json()) as { value: unknown };
  return Array.isArray(data.value) && data.value.length > 0
    ? (data.value as string[])
    : DEFAULT_DTC_MEANINGS;
}

/** Public list of header subtitles (DB-backed, defaults as fallback). */
export function useDtcMeanings() {
  return useQuery({
    queryKey: ["dtc-meanings"],
    queryFn: getMeanings,
    staleTime: STALE_TIME,
  });
}

/**
 * Pick one random subtitle for the current mount. Returns null until the list
 * has loaded on the client, which keeps the server render and the first client
 * render identical (no hydration mismatch — the subtitle is client-only).
 */
export function useRandomDtcMeaning(): string | null {
  const { data } = useDtcMeanings();
  // Stable per mount: the index is chosen once, so re-renders don't reshuffle.
  const [seed] = useState(() => Math.random());
  if (!data || data.length === 0) return null;
  return data[Math.floor(seed * data.length)];
}

/** Update the subtitles list (committee only) and refresh the public list. */
export function useUpdateDtcMeanings() {
  const queryClient = useQueryClient();
  return useMutation<string[], Error, string[]>({
    mutationFn: async (meanings) => {
      const res = await fetch(`/api/settings/${KEY}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: meanings }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Échec de l'enregistrement");
      }
      const data = (await res.json()) as { value: string[] };
      return data.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dtc-meanings"] });
    },
  });
}
