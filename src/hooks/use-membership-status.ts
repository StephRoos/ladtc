"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { isSeasonCurrent } from "@/lib/membership";
import type { Membership } from "@/types";

type OrderEligibility =
  | { canOrder: true }
  | { canOrder: false; reason: "not_authenticated" }
  | { canOrder: false; reason: "no_membership" }
  | { canOrder: false; reason: "membership_not_active" }
  | { canOrder: false; reason: "season_expired" };

/**
 * Determines whether the current user is eligible to place equipment orders.
 * Requires: authenticated + membership ACTIVE + current season.
 */
export function useMembershipStatus(): {
  eligibility: OrderEligibility;
  isLoading: boolean;
} {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Only fetch membership when authenticated — avoids 401 for anonymous visitors
  const { data, isLoading: memberLoading } = useQuery<{ membership: Membership | null }>({
    queryKey: ["member", "me"],
    queryFn: async () => {
      const res = await fetch("/api/members/me");
      if (!res.ok) throw new Error("Failed to fetch membership");
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  if (authLoading || (isAuthenticated && memberLoading)) {
    return { eligibility: { canOrder: false, reason: "not_authenticated" }, isLoading: true };
  }

  if (!isAuthenticated) {
    return { eligibility: { canOrder: false, reason: "not_authenticated" }, isLoading: false };
  }

  const membership = data?.membership;

  if (!membership) {
    return { eligibility: { canOrder: false, reason: "no_membership" }, isLoading: false };
  }

  if (membership.status !== "ACTIVE") {
    return { eligibility: { canOrder: false, reason: "membership_not_active" }, isLoading: false };
  }

  if (!isSeasonCurrent(membership.season)) {
    return { eligibility: { canOrder: false, reason: "season_expired" }, isLoading: false };
  }

  return { eligibility: { canOrder: true }, isLoading: false };
}
