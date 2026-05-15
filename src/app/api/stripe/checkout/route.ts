import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for an equipment order.
 * Expects { orderId } in body.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  let body: { orderId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { orderId } = body;
  if (!orderId) {
    return NextResponse.json({ error: "orderId requis" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (order.userId !== authResult.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // Any non-cancelled, non-delivered, unpaid order can trigger a Stripe Checkout.
  // - PENDING: grouped order, member chooses to pay early (or wait for the lot).
  // - BATCHED / ORDERED: lot in progress, member can pay anytime once decided.
  // - RECEIVED: direct-stock sale at order creation, OR a batched order whose lot
  //   has arrived at the club and is now collectable.
  if (order.status === "CANCELLED") {
    return NextResponse.json({ error: "Cette commande a été annulée" }, { status: 400 });
  }
  if (order.status === "DELIVERED") {
    return NextResponse.json({ error: "Cette commande a déjà été livrée" }, { status: 400 });
  }
  if (order.paidAt) {
    return NextResponse.json({ error: "Cette commande a déjà été payée" }, { status: 400 });
  }

  // Idempotent: reuse existing session if still open
  if (order.stripeSessionId) {
    try {
      const existingSession = await getStripe().checkout.sessions.retrieve(order.stripeSessionId);
      if (existingSession.status === "open") {
        return NextResponse.json({ url: existingSession.url });
      }
    } catch {
      // Session expired or invalid, create a new one
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: "eur",
      product_data: {
        name: item.product.name + (item.size ? ` (${item.size})` : ""),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "bancontact"],
    line_items: lineItems,
    metadata: {
      type: "equipment_order",
      orderId: order.id,
    },
    success_url: `${appUrl}/equipment/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/equipment/order/${order.id}?payment=cancelled`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
