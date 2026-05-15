import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/batches/[batchId]/cancel
 * Cancels every order in the batch (status → CANCELLED). Restricted to
 * COMMITTEE / ADMIN.
 *
 * No stock action: batched orders never decremented stock at creation, so
 * cancelling them does not restore anything. Direct-stock cancellations go
 * through PATCH /api/orders/[id] which handles the per-order stock restore.
 *
 * Already-paid orders are NOT excluded — the admin sees the paidAt flag and
 * decides; refunds happen out-of-band via Stripe and are out of scope here.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { batchId } = await params;

  const orders = await prisma.order.findMany({
    where: { batchId },
    select: { id: true, status: true, paidAt: true },
  });
  if (orders.length === 0) {
    return NextResponse.json({ error: "Lot introuvable" }, { status: 404 });
  }

  await prisma.order.updateMany({
    where: { batchId },
    data: { status: "CANCELLED" },
  });

  const paidCount = orders.filter((o) => o.paidAt !== null).length;

  return NextResponse.json({
    batchId,
    orderCount: orders.length,
    paidCount,
    action: "cancelled",
  });
}
