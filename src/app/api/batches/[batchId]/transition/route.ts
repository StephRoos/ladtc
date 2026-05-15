import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { sendOrderReadyForPayment } from "@/lib/email";
import { z } from "zod";

const transitionSchema = z.object({
  status: z.enum(["ORDERED", "RECEIVED"]),
  surplus: z
    .array(
      z.object({
        productId: z.string(),
        size: z.string().min(1),
        quantity: z.number().int().nonnegative(),
      })
    )
    .optional(),
});

/**
 * POST /api/batches/[batchId]/transition
 * Bulk-transitions all orders in a batch to a new status.
 * Restricted to COMMITTEE / ADMIN.
 *
 * Valid target statuses:
 *  - ORDERED: marks the batch as placed with the supplier
 *  - RECEIVED: marks the batch as physically received. Optionally accepts a
 *    `surplus` payload to credit per-(product, size) excess quantities to the
 *    ProductStock table in the same transaction. Also triggers the
 *    "ready for payment" email for unpaid orders in the batch.
 *
 * Body:
 *   { status: "ORDERED" }
 *   { status: "RECEIVED", surplus?: [{ productId, size, quantity }, ...] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { batchId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = transitionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { status, surplus } = parsed.data;
  if (status !== "RECEIVED" && surplus && surplus.length > 0) {
    return NextResponse.json(
      { error: "Le surplus n'est applicable qu'à la transition RECEIVED" },
      { status: 422 }
    );
  }

  const orders = await prisma.order.findMany({
    where: { batchId },
    select: { id: true, status: true },
  });
  if (orders.length === 0) {
    return NextResponse.json({ error: "Lot introuvable" }, { status: 404 });
  }

  // Enforce a sane state machine: BATCHED -> ORDERED -> RECEIVED. The PATCH
  // endpoint stays open for individual exceptions (admin overrides).
  const expectedCurrent = status === "ORDERED" ? "BATCHED" : "ORDERED";
  const wrongState = orders.filter((o) => o.status !== expectedCurrent);
  if (wrongState.length > 0) {
    return NextResponse.json(
      {
        error: `Transition ${expectedCurrent} → ${status} impossible : ${wrongState.length} commande(s) avec un statut différent`,
      },
      { status: 409 }
    );
  }

  // If admin sent surplus entries, validate they reference real products + sizes.
  if (surplus && surplus.length > 0) {
    const productIds = [...new Set(surplus.map((s) => s.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, sizes: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const entry of surplus) {
      const product = productMap.get(entry.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Produit ${entry.productId} introuvable dans le surplus` },
          { status: 422 }
        );
      }
      if (!product.sizes.includes(entry.size)) {
        return NextResponse.json(
          { error: `Taille ${entry.size} non disponible pour le produit ${entry.productId}` },
          { status: 422 }
        );
      }
    }
  }

  const now = new Date();
  const timestampField = status === "ORDERED" ? "orderedAt" : "receivedAt";

  await prisma.$transaction(async (tx) => {
    await tx.order.updateMany({
      where: { batchId },
      data: { status, [timestampField]: now },
    });

    if (status === "RECEIVED" && surplus && surplus.length > 0) {
      for (const entry of surplus) {
        if (entry.quantity === 0) continue;
        await tx.productStock.upsert({
          where: {
            productId_size: { productId: entry.productId, size: entry.size },
          },
          update: { quantity: { increment: entry.quantity } },
          create: {
            productId: entry.productId,
            size: entry.size,
            quantity: entry.quantity,
          },
        });
      }
    }
  });

  // Side effect: when transitioning INTO RECEIVED, notify unpaid members so
  // they can settle their order. Soft failure — admin can re-trigger per order.
  if (status === "RECEIVED") {
    const unpaidOrders = await prisma.order.findMany({
      where: { batchId, paidAt: null },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });
    for (const order of unpaidOrders) {
      try {
        await sendOrderReadyForPayment(order);
      } catch (err) {
        console.error(
          `[batches] Failed to send 'ready for payment' email for order ${order.id}`,
          err
        );
      }
    }
  }

  return NextResponse.json({ batchId, status, orderCount: orders.length });
}
