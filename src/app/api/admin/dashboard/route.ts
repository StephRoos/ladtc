import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DashboardStats } from "@/types";

const ALLOWED_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * GET /api/admin/dashboard
 * Returns KPI stats for the admin dashboard.
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ALLOWED_ROLES.includes(userRole as (typeof ALLOWED_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

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
