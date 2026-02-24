import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { StatisticsData } from "@/types";

const ALLOWED_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * GET /api/admin/statistics
 * Returns detailed statistics: member breakdown, trends, top products, revenue.
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
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [active, pending, inactive, expired, orders, topProductsRaw] = await Promise.all([
    prisma.membership.count({ where: { status: "ACTIVE" } }),
    prisma.membership.count({ where: { status: "PENDING" } }),
    prisma.membership.count({ where: { status: "INACTIVE" } }),
    prisma.membership.count({ where: { status: "EXPIRED" } }),
    prisma.order.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true, total: true, status: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Build month labels for the last 12 months
  const monthLabels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(
      d.toLocaleDateString("fr-BE", { month: "short", year: "2-digit" })
    );
  }

  // Member registrations per month
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: twelveMonthsAgo } },
    select: { createdAt: true },
  });

  const memberTrendMap = new Map<string, number>();
  monthLabels.forEach((m) => memberTrendMap.set(m, 0));
  users.forEach((u) => {
    const label = new Date(u.createdAt).toLocaleDateString("fr-BE", {
      month: "short",
      year: "2-digit",
    });
    if (memberTrendMap.has(label)) {
      memberTrendMap.set(label, (memberTrendMap.get(label) ?? 0) + 1);
    }
  });

  // Orders per month
  const orderTrendMap = new Map<string, number>();
  monthLabels.forEach((m) => orderTrendMap.set(m, 0));
  orders.forEach((o) => {
    const label = new Date(o.createdAt).toLocaleDateString("fr-BE", {
      month: "short",
      year: "2-digit",
    });
    if (orderTrendMap.has(label)) {
      orderTrendMap.set(label, (orderTrendMap.get(label) ?? 0) + 1);
    }
  });

  // Top 5 products with names
  const productIds = topProductsRaw.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  const topProducts = topProductsRaw.map((p) => ({
    productId: p.productId,
    name: productMap.get(p.productId) ?? "Produit inconnu",
    salesCount: p._sum.quantity ?? 0,
  }));

  // Total revenue
  const revenueResult = await prisma.order.aggregate({
    where: {
      status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
    },
    _sum: { total: true },
  });

  const stats: StatisticsData = {
    memberBreakdown: { ACTIVE: active, PENDING: pending, INACTIVE: inactive, EXPIRED: expired },
    memberTrend: monthLabels.map((m) => ({ month: m, count: memberTrendMap.get(m) ?? 0 })),
    orderTrend: monthLabels.map((m) => ({ month: m, count: orderTrendMap.get(m) ?? 0 })),
    topProducts,
    totalRevenue: revenueResult._sum.total ?? 0,
    totalOrders: orders.length,
  };

  return NextResponse.json(stats);
}
