import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

/**
 * GET /api/events
 * Returns a paginated list of upcoming events. Public endpoint.
 *
 * Query params:
 *   - page: number (default: 1)
 *   - per_page: number (default: 10, max: 50)
 *   - type: EventType filter (optional)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(
    parseInt(searchParams.get("per_page") ?? String(PAGE_SIZE), 10),
    50
  );
  const skip = (page - 1) * perPage;
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {
    date: { gte: new Date() },
  };

  if (type && ["TRAINING", "RACE", "CAMP", "SOCIAL"].includes(type)) {
    where.type = type;
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      skip,
      take: perPage,
      include: {
        _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({
    events,
    total,
    totalPages: Math.ceil(total / perPage),
  });
}
