import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

/**
 * GET /api/admin/users
 * Returns paginated list of all users.
 * Restricted to ADMIN only.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdmin(request);
  if (isAuthError(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        committeeRole: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    users,
    total,
    pages: Math.ceil(total / PAGE_SIZE),
    page,
  });
}
