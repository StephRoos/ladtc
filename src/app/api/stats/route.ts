import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/stats
 * Returns global statistics about the LADTC platform.
 * Public endpoint - no authentication required.
 * 
 * Response includes:
 * - totalMembers: Total registered users
 * - activeMembers: Users with ACTIVE membership
 * - publishedPosts: Published blog posts count
 * - pendingOrders: Orders awaiting processing
 */
export async function GET(): Promise<NextResponse> {
  try {
    const [
      totalUsers,
      activeMemberships,
      publishedPosts,
      pendingOrders,
      totalProducts,
      upcomingEvents,
    ] = await Promise.all([
      // Total registered users
      prisma.user.count(),
      
      // Active memberships
      prisma.membership.count({
        where: { status: "ACTIVE" },
      }),
      
      // Published blog posts
      prisma.blogPost.count({
        where: { published: true },
      }),
      
      // Pending orders
      prisma.order.count({
        where: { status: "PENDING" },
      }),
      
      // Total products in catalog
      prisma.product.count({
        where: { active: true },
      }),
      
      // Upcoming events (from today onwards)
      prisma.event.count({
        where: { date: { gte: new Date() } },
      }),
    ]);

    return NextResponse.json({
      stats: {
        members: {
          total: totalUsers,
          active: activeMemberships,
        },
        content: {
          blogPosts: publishedPosts,
          products: totalProducts,
        },
        orders: {
          pending: pendingOrders,
        },
        events: {
          upcoming: upcomingEvents,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Stats] Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
