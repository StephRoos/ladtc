import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/events/[id]
 * Returns a single event by ID with registration count. Public endpoint.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
      registrations: {
        where: { status: "REGISTERED" },
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, name: true } },
          createdAt: true,
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  return NextResponse.json({ event });
}
