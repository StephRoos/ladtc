import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "node:crypto";

const createBatchSchema = z.object({
  orderIds: z
    .array(z.string())
    .min(1, "Au moins une commande requise pour créer un lot"),
});

/**
 * GET /api/batches
 * Returns aggregated batch summaries. Restricted to COMMITTEE / ADMIN.
 *
 * Each row groups orders sharing the same batchId. The batch status is the
 * status of any order in the group (orders move together via bulk transitions,
 * so they should always be aligned).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const orders = await prisma.order.findMany({
    where: { batchId: { not: null } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const groups = new Map<
    string,
    {
      batchId: string;
      status: string;
      orderCount: number;
      itemCount: number;
      total: number;
      batchedAt: Date | null;
      orderedAt: Date | null;
      receivedAt: Date | null;
      firstOrderAt: Date;
    }
  >();
  for (const order of orders) {
    if (!order.batchId) continue;
    const existing = groups.get(order.batchId);
    if (!existing) {
      groups.set(order.batchId, {
        batchId: order.batchId,
        status: order.status,
        orderCount: 1,
        itemCount: order.items.length,
        total: order.total,
        batchedAt: order.batchedAt,
        orderedAt: order.orderedAt,
        receivedAt: order.receivedAt,
        firstOrderAt: order.createdAt,
      });
    } else {
      existing.orderCount += 1;
      existing.itemCount += order.items.length;
      existing.total += order.total;
      if (order.createdAt < existing.firstOrderAt) existing.firstOrderAt = order.createdAt;
    }
  }

  return NextResponse.json({ batches: Array.from(groups.values()) });
}

/**
 * POST /api/batches
 * Groups a set of PENDING orders into a single new batch and transitions them
 * all to BATCHED in one transaction. Restricted to COMMITTEE / ADMIN.
 *
 * Body: { orderIds: string[] }
 *
 * Constraints:
 *  - All orders must exist
 *  - All orders must currently be PENDING (cannot re-batch already-batched orders)
 *  - All orders must have no existing batchId
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = createBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { orderIds } = parsed.data;

  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    select: { id: true, status: true, batchId: true },
  });

  if (orders.length !== orderIds.length) {
    return NextResponse.json(
      { error: "Une ou plusieurs commandes sont introuvables" },
      { status: 422 }
    );
  }

  const invalid = orders.filter((o) => o.status !== "PENDING" || o.batchId !== null);
  if (invalid.length > 0) {
    return NextResponse.json(
      {
        error: `Commandes non éligibles au regroupement (statut ≠ PENDING ou déjà dans un lot) : ${invalid
          .map((o) => o.id.slice(-8))
          .join(", ")}`,
      },
      { status: 409 }
    );
  }

  const batchId = randomUUID();
  const now = new Date();

  await prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { batchId, status: "BATCHED", batchedAt: now },
  });

  return NextResponse.json({ batchId, orderCount: orderIds.length }, { status: 201 });
}
