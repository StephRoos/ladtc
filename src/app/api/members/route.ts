import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["COMMITTEE", "ADMIN"] as const;
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
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ALLOWED_ROLES.includes(userRole as (typeof ALLOWED_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

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
