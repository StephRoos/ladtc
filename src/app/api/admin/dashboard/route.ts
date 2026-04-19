import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { getCurrentSeason } from "@/lib/membership";
import type { DashboardStats } from "@/types";

/**
 * GET /api/admin/dashboard
 * Returns KPI stats for the admin dashboard.
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const currentSeason = getCurrentSeason();

  const [totalMembers, activeMembers, unpaidCurrentSeason, pendingOrders, recentRegistrations] =
    await Promise.all([
      prisma.user.count(),
      prisma.membership.count({ where: { status: "ACTIVE" } }),
      prisma.membership.count({
        where: {
          NOT: { season: currentSeason },
          status: { not: "INACTIVE" },
        },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

  const stats: DashboardStats = {
    totalMembers,
    activeMembers,
    unpaidCurrentSeason,
    pendingOrders,
    recentRegistrations,
  };

  return NextResponse.json({ stats });
}
