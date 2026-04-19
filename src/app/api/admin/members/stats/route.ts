import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { getCurrentSeason } from "@/lib/membership";
import type { MemberStats } from "@/types";

/**
 * GET /api/admin/members/stats
 * Returns membership statistics for the admin dashboard.
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const currentSeason = getCurrentSeason();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, active, pending, inactive, expired, revenueResult, unpaidCurrentSeason, newThisWeek] =
    await Promise.all([
      prisma.membership.count(),
      prisma.membership.count({ where: { status: "ACTIVE" } }),
      prisma.membership.count({ where: { status: "PENDING" } }),
      prisma.membership.count({ where: { status: "INACTIVE" } }),
      prisma.membership.count({ where: { status: "EXPIRED" } }),
      prisma.membership.aggregate({
        where: { status: "ACTIVE" },
        _sum: { amount: true },
      }),
      // Members without a paid season matching the current one
      prisma.membership.count({
        where: {
          OR: [
            { season: { not: currentSeason } },
            { season: null },
          ],
          status: { not: "INACTIVE" },
        },
      }),
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
    ]);

  const stats: MemberStats = {
    total,
    active,
    pending,
    inactive,
    expired,
    revenue: revenueResult._sum.amount ?? 0,
    unpaidCurrentSeason,
    newThisWeek,
  };

  return NextResponse.json(stats);
}
