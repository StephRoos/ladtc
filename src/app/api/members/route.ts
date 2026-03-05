import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

/**
 * GET /api/members
 * Returns a paginated, filtered list of all members.
 * Restricted to COMMITTEE and ADMIN roles.
 *
 * Query params:
 *   - status: MembershipStatus filter
 *   - search: name or email substring
 *   - sort: "name" | "joinedAt" | "renewalDate" (default: "name")
 *   - page: page number (default: 1)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "name";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const validStatuses = ["PENDING", "ACTIVE", "INACTIVE", "EXPIRED"] as const;
  const statusFilter =
    status && validStatuses.includes(status as (typeof validStatuses)[number])
      ? (status as (typeof validStatuses)[number])
      : undefined;

  const where = {
    ...(statusFilter && {
      membership: { status: statusFilter },
    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const orderBy =
    sort === "joinedAt"
      ? { membership: { joinedAt: "asc" as const } }
      : sort === "renewalDate"
        ? { membership: { renewalDate: "asc" as const } }
        : { name: "asc" as const };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { membership: true },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return NextResponse.json({
    members: users,
    total,
    pages: Math.ceil(total / PAGE_SIZE),
    page,
  });
}
