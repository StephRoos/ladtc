import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import type { DashboardStats } from "@/types";

/**
 * GET /api/admin/dashboard
 * Returns KPI stats for the admin dashboard.
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalMembers, activeMembers, pendingRenewals, pendingOrders, recentRegistrations] =
    await Promise.all([
      prisma.user.count(),
      prisma.membership.count({ where: { status: "ACTIVE" } }),
      prisma.membership.count({
        where: {
          status: "ACTIVE",
          renewalDate: { gte: now, lte: thirtyDaysFromNow },
        },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

  const stats: DashboardStats = {
    totalMembers,
    activeMembers,
    pendingRenewals,
    pendingOrders,
    recentRegistrations,
  };

  return NextResponse.json({ stats });
}
