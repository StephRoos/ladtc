"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@/types";

interface DashboardResponse {
  stats: DashboardStats;
}

/**
 * Fetch dashboard KPI stats from the API.
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch("/api/admin/dashboard");
  if (!res.ok) {
    throw new Error("Impossible de charger les statistiques du tableau de bord");
  }
  const data = (await res.json()) as DashboardResponse;
  return data.stats;
}

/**
 * Hook to fetch admin dashboard KPI stats.
 *
 * @returns TanStack Query result with DashboardStats
 */
export function useDashboardStats(): ReturnType<typeof useQuery<DashboardStats>> {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
  });
}
