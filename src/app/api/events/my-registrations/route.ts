import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/events/my-registrations
 * Returns the current user's event registrations. Supports optional
 * `status` filter (REGISTERED, ATTENDED, CANCELLED) and `upcoming=true`
 * to restrict to future events.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const upcoming = searchParams.get("upcoming") === "true";

  const registrations = await prisma.eventRegistration.findMany({
    where: {
      userId: authResult.user.id,
      ...(status && ["REGISTERED", "ATTENDED", "CANCELLED"].includes(status)
        ? { status: status as "REGISTERED" | "ATTENDED" | "CANCELLED" }
        : {}),
      ...(upcoming ? { event: { date: { gte: new Date() } } } : {}),
    },
    include: {
      event: {
        include: {
          _count: {
            select: { registrations: { where: { status: "REGISTERED" } } },
          },
        },
      },
    },
    orderBy: { event: { date: "asc" } },
  });

  return NextResponse.json({ registrations });
}
