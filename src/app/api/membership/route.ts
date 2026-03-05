import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/membership
 * Returns the current user's membership.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const membership = await prisma.membership.findUnique({
    where: { userId: authResult.user.id },
  });

  return NextResponse.json({ membership });
}
