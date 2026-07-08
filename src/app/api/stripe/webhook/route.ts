import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendPaymentConfirmation, sendMembershipPaymentConfirmation, sendEmail } from "@/lib/email";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events (checkout.session.completed).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadataType = session.metadata?.type;

    if (metadataType === "equipment_order") {
      await handleEquipmentOrder(session);
    } else if (metadataType === "membership_dues") {
      await handleMembershipDues(session);
    } else if (metadataType === "event_registration") {
      await handleEventRegistration(session);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleEquipmentOrder(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("[Stripe Webhook] Missing orderId in metadata");
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, user: true },
  });

  if (!order) {
    console.error("[Stripe Webhook] Order not found:", orderId);
    return;
  }

  // Idempotent: skip if already paid
  if (order.paidAt) {
    return;
  }

  // New grouped-orders workflow (Issue #16): the order stays PENDING after payment;
  // the admin moves it to BATCHED -> ORDERED -> RECEIVED -> DELIVERED. Status is no longer
  // advanced by the payment event itself, only paidAt is recorded.
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paidAt: new Date(),
      stripePaymentIntentId: session.payment_intent as string | null,
    },
  });

  try {
    const fullOrder = { ...order, paidAt: new Date() };
    await sendPaymentConfirmation(fullOrder);
  } catch (err) {
    console.error("[Stripe Webhook] Failed to send payment confirmation email:", err);
  }
}

async function handleMembershipDues(session: Stripe.Checkout.Session): Promise<void> {
  const membershipId = session.metadata?.membershipId;
  if (!membershipId) {
    console.error("[Stripe Webhook] Missing membershipId in metadata");
    return;
  }

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { user: true },
  });

  if (!membership) {
    console.error("[Stripe Webhook] Membership not found:", membershipId);
    return;
  }

  // Set season to current season (Sept 1 to Aug 31)
  const { getCurrentSeason } = await import("@/lib/membership");
  const currentSeason = getCurrentSeason();

  await prisma.membership.update({
    where: { id: membershipId },
    data: {
      status: "ACTIVE",
      paidAt: new Date(),
      season: currentSeason,
      stripeSessionId: null, // Clear to allow next payment
    },
  });

  try {
    const name = membership.user.name ?? membership.user.email;
    await sendMembershipPaymentConfirmation(
      membership.user.email,
      name,
      membership.amount,
      currentSeason,
    );
  } catch (err) {
    console.error("[Stripe Webhook] Failed to send membership confirmation email:", err);
  }
}

async function handleEventRegistration(session: Stripe.Checkout.Session): Promise<void> {
  const registrationId = session.metadata?.registrationId;
  if (!registrationId) {
    console.error("[Stripe Webhook] Missing registrationId in metadata");
    return;
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: { user: true, event: true },
  });

  if (!registration) {
    console.error("[Stripe Webhook] Event registration not found:", registrationId);
    return;
  }

  // Idempotent: skip if already paid
  if (registration.paidAt) {
    return;
  }

  await prisma.eventRegistration.update({
    where: { id: registrationId },
    data: {
      paidAt: new Date(),
      stripeSessionId: null,
    },
  });

  try {
    await sendEmail(
      registration.user.email,
      `Inscription confirmée — ${registration.event.title}`,
      `<p>Bonjour ${registration.user.name ?? registration.user.email},</p>
       <p>Votre inscription à <strong>${registration.event.title}</strong> a bien été confirmée.</p>
       <p>Merci et à bientôt !</p>`,
    );
  } catch (err) {
    console.error("[Stripe Webhook] Failed to send event registration confirmation email:", err);
  }
}
