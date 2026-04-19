import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/stripe/membership
 * Creates a Stripe Checkout session for membership dues payment.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const membership = await prisma.membership.findUnique({
    where: { userId: session.user.id },
  });

  if (!membership) {
    return NextResponse.json({ error: "Aucune cotisation trouvée" }, { status: 404 });
  }

  // Block if already paid for the current season
  const { isSeasonCurrent } = await import("@/lib/membership");
  if (membership.status === "ACTIVE" && isSeasonCurrent(membership.season)) {
    return NextResponse.json(
      { error: "La cotisation est déjà payée pour la saison en cours." },
      { status: 400 },
    );
  }

  // Idempotent: reuse existing session if still open
  if (membership.stripeSessionId) {
    try {
      const existingSession = await getStripe().checkout.sessions.retrieve(membership.stripeSessionId);
      if (existingSession.status === "open") {
        return NextResponse.json({ url: existingSession.url });
      }
    } catch {
      // Session expired or invalid, create a new one
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const amount = membership.amount || 50;

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "bancontact"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Cotisation annuelle LADTC",
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "membership_dues",
      membershipId: membership.id,
    },
    success_url: `${appUrl}/membership/pay/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/profile?payment=cancelled`,
  });

  await prisma.membership.update({
    where: { id: membership.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
