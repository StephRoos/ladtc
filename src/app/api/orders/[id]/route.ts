import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireCommittee, isAuthError, COMMITTEE_ROLES } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { orderUpdateSchema } from "@/lib/schemas";
import { sendOrderReadyForPayment } from "@/lib/email";

/**
 * GET /api/orders/[id]
 * Returns a single order. Members can only see their own orders; admins see all.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const isAdmin = COMMITTEE_ROLES.includes(authResult.user.role);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (!isAdmin && order.userId !== authResult.user.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  return NextResponse.json({ order });
}

/**
 * PATCH /api/orders/[id]
 * Updates order status, tracking number, or notes. Restricted to COMMITTEE and ADMIN roles.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = orderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const updateData: Record<string, unknown> = { ...parsed.data };

  // Each transition INTO a status stamps its dedicated column the first time it
  // happens. Re-saving the same status does not overwrite an existing timestamp.
  const now = new Date();
  if (parsed.data.status === "BATCHED" && !existing.batchedAt) {
    updateData.batchedAt = now;
  }
  if (parsed.data.status === "ORDERED" && !existing.orderedAt) {
    updateData.orderedAt = now;
  }
  if (parsed.data.status === "RECEIVED" && !existing.receivedAt) {
    updateData.receivedAt = now;
  }
  if (parsed.data.status === "DELIVERED" && !existing.deliveredAt) {
    updateData.deliveredAt = now;
  }

  // Direct-stock cancel: if a member's order was fulfilled from existing stock
  // (created with status RECEIVED, no batch) and the admin now cancels it,
  // restore the items to ProductStock so they can be sold again. Batched
  // orders never decremented stock at creation, so no restoration is needed
  // for them.
  const restoreStock =
    parsed.data.status === "CANCELLED" &&
    existing.status === "RECEIVED" &&
    existing.batchId === null;

  const order = await prisma.$transaction(async (tx) => {
    if (restoreStock) {
      const itemsToRestore = await tx.orderItem.findMany({
        where: { orderId: id },
        select: { productId: true, size: true, quantity: true },
      });
      for (const item of itemsToRestore) {
        if (!item.size) continue;
        await tx.productStock.upsert({
          where: { productId_size: { productId: item.productId, size: item.size } },
          update: { quantity: { increment: item.quantity } },
          create: { productId: item.productId, size: item.size, quantity: item.quantity },
        });
      }
    }
    return tx.order.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });
  });

  // Grouped-orders payment trigger: when an order transitions INTO `RECEIVED`
  // from a different status and is not yet paid, the member receives an email
  // with a Stripe Checkout link (the order page already exposes a Payer button).
  // Direct-stock orders (created RECEIVED at checkout time) are excluded — they
  // have already been paid via Stripe at order creation, so existing.status was
  // already RECEIVED and we don't re-notify.
  if (
    parsed.data.status === "RECEIVED" &&
    existing.status !== "RECEIVED" &&
    !existing.paidAt
  ) {
    try {
      await sendOrderReadyForPayment(order);
    } catch (err) {
      // Soft failure: the status update is the source of truth, the email is
      // an outbound side effect that the admin can re-send manually if needed.
      console.error("[orders] Failed to send 'ready for payment' email", err);
    }
  }

  return NextResponse.json({ order });
}

/**
 * DELETE /api/orders/[id]
 * Hard-deletes an order. Restricted to COMMITTEE / ADMIN.
 *
 * Refused when the order has been paid (paidAt is set) — paid orders must be
 * kept for financial traceability. The admin can soft-cancel them instead via
 * PATCH with status: CANCELLED.
 *
 * Direct-stock orders (status RECEIVED, no batchId) have their items restored
 * to ProductStock before deletion. OrderItem rows cascade thanks to onDelete.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: { select: { productId: true, size: true, quantity: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (existing.paidAt) {
    return NextResponse.json(
      {
        error:
          "Impossible de supprimer une commande payée — utiliser l'annulation pour préserver la traçabilité financière",
      },
      { status: 409 }
    );
  }

  const restoreStock =
    existing.status === "RECEIVED" && existing.batchId === null;

  await prisma.$transaction(async (tx) => {
    if (restoreStock) {
      for (const item of existing.items) {
        if (!item.size) continue;
        await tx.productStock.upsert({
          where: { productId_size: { productId: item.productId, size: item.size } },
          update: { quantity: { increment: item.quantity } },
          create: { productId: item.productId, size: item.size, quantity: item.quantity },
        });
      }
    }
    await tx.order.delete({ where: { id } });
  });

  return NextResponse.json({ success: true, stockRestored: restoreStock });
}
