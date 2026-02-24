"use client";

import { useQuery } from "@tanstack/react-query";
import type { StatisticsData } from "@/types";

/**
 * Fetch detailed statistics from the API.
 */
async function fetchStatistics(): Promise<StatisticsData> {
  const res = await fetch("/api/admin/statistics");
  if (!res.ok) {
    throw new Error("Impossible de charger les statistiques");
  }
  return res.json() as Promise<StatisticsData>;
}

/**
 * Hook to fetch admin statistics data.
 *
 * @returns TanStack Query result with StatisticsData
 */
export function useStatistics(): ReturnType<typeof useQuery<StatisticsData>> {
  return useQuery<StatisticsData>({
    queryKey: ["admin-statistics"],
    queryFn: fetchStatistics,
    staleTime: 10 * 60 * 1000,
  });
}
