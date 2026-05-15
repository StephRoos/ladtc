import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/batches/[batchId]/ungroup
 * Dissolves a batch that has not been ordered with the supplier yet: every
 * order in the batch loses its batchId, reverts to status PENDING, and its
 * batchedAt timestamp is cleared. Restricted to COMMITTEE / ADMIN.
 *
 * Refused if any order is past BATCHED — once the lot has been ordered,
 * received, etc., it cannot be unmade without manual intervention.
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
    select: { id: true, status: true },
  });
  if (orders.length === 0) {
    return NextResponse.json({ error: "Lot introuvable" }, { status: 404 });
  }

  const notBatched = orders.filter((o) => o.status !== "BATCHED");
  if (notBatched.length > 0) {
    return NextResponse.json(
      {
        error: `Dégroupage impossible : ${notBatched.length} commande(s) déjà au-delà de BATCHED. Le lot a déjà avancé dans le workflow.`,
      },
      { status: 409 }
    );
  }

  await prisma.order.updateMany({
    where: { batchId },
    data: { batchId: null, status: "PENDING", batchedAt: null },
  });

  return NextResponse.json({ batchId, orderCount: orders.length, action: "ungrouped" });
}
