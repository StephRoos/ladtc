import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activityLogFilterSchema } from "@/lib/schemas";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/activity-logs
 * Returns paginated activity logs with optional filters.
 * Query params: action, startDate, endDate, userId, skip, take
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const parsed = activityLogFilterSchema.safeParse({
    action: searchParams.get("action") ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    userId: searchParams.get("userId") ?? undefined,
    skip: searchParams.get("skip") ?? 0,
    take: searchParams.get("take") ?? 50,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const { action, startDate, endDate, userId, skip, take } = parsed.data;

  const where = {
    ...(action ? { action } : {}),
    ...(userId ? { userId } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total });
}
