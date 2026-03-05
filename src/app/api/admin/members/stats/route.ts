import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import type { MemberStats } from "@/types";

/**
 * GET /api/admin/members/stats
 * Returns membership statistics for the admin dashboard.
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, active, pending, inactive, expired, revenueResult, upcomingRenewals, newThisWeek] =
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
      prisma.membership.count({
        where: {
          status: "ACTIVE",
          renewalDate: { gte: now, lte: thirtyDaysFromNow },
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
    upcomingRenewals,
    newThisWeek,
  };

  return NextResponse.json(stats);
}
