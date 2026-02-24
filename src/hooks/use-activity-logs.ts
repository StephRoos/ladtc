"use client";

import { useQuery } from "@tanstack/react-query";
import type { ActivityLogEntry } from "@/types";

export interface ActivityLogsFilters {
  action?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  skip?: number;
  take?: number;
}

interface ActivityLogsResponse {
  logs: ActivityLogEntry[];
  total: number;
}

/**
 * Fetch activity logs from the API with optional filters.
 */
async function fetchActivityLogs(
  filters: ActivityLogsFilters
): Promise<ActivityLogsResponse> {
  const params = new URLSearchParams();
  if (filters.action) params.set("action", filters.action);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.skip !== undefined) params.set("skip", String(filters.skip));
  if (filters.take !== undefined) params.set("take", String(filters.take));

  const res = await fetch(`/api/admin/activity-logs?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Impossible de charger les logs d'activité");
  }
  return res.json() as Promise<ActivityLogsResponse>;
}

/**
 * Hook to fetch paginated activity logs with optional filters.
 *
 * @param filters - Optional action, date range, userId, and pagination params
 * @returns TanStack Query result with activity logs and total count
 */
export function useActivityLogs(
  filters: ActivityLogsFilters = {}
): ReturnType<typeof useQuery<ActivityLogsResponse>> {
  return useQuery<ActivityLogsResponse>({
    queryKey: ["activity-logs", filters],
    queryFn: () => fetchActivityLogs(filters),
    staleTime: 2 * 60 * 1000,
  });
}
