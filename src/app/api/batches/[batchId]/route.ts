import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/batches/[batchId]
 * Returns the full detail of a single batch: all orders, members, items, and
 * the computed batch status. Restricted to COMMITTEE / ADMIN.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { batchId } = await params;

  const orders = await prisma.order.findMany({
    where: { batchId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (orders.length === 0) {
    return NextResponse.json({ error: "Lot introuvable" }, { status: 404 });
  }

  return NextResponse.json({ batchId, orders });
}
