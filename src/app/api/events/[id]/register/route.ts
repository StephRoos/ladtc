import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/events/[id]/register
 * Register the current user for an event. Requires authentication.
 * If the event has a price > 0, creates a Stripe Checkout session instead of
 * registering immediately. Registration is finalized by the webhook after payment.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
      registrations: {
        where: { userId: authResult.user.id },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  if (
    event.maxParticipants &&
    event._count.registrations >= event.maxParticipants
  ) {
    return NextResponse.json({ error: "Événement complet" }, { status: 409 });
  }

  const existing = event.registrations[0];

  if (existing && existing.status === "REGISTERED" && existing.paidAt) {
    return NextResponse.json({ error: "Déjà inscrit" }, { status: 409 });
  }

  // Paid event: create or reuse a Stripe Checkout session.
  if (event.price && event.price > 0) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Reuse an existing open session if possible.
    if (existing?.stripeSessionId) {
      try {
        const existingSession = await getStripe().checkout.sessions.retrieve(
          existing.stripeSessionId
        );
        if (existingSession.status === "open") {
          return NextResponse.json({ url: existingSession.url });
        }
      } catch {
        // Session expired or invalid, create a new one below.
      }
    }

    const registration = existing
      ? await prisma.eventRegistration.update({
          where: { id: existing.id },
          data: { status: "REGISTERED" },
        })
      : await prisma.eventRegistration.create({
          data: {
            userId: authResult.user.id,
            eventId: id,
            status: "REGISTERED",
          },
        });

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "bancontact"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Inscription — ${event.title}`,
            },
            unit_amount: Math.round(event.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "event_registration",
        registrationId: registration.id,
      },
      success_url: `${appUrl}/events/${id}?payment=success`,
      cancel_url: `${appUrl}/events/${id}?payment=cancelled`,
    });

    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  // Free event: register immediately.
  const registration = existing
    ? await prisma.eventRegistration.update({
        where: { id: existing.id },
        data: { status: "REGISTERED" },
      })
    : await prisma.eventRegistration.create({
        data: {
          userId: authResult.user.id,
          eventId: id,
        },
      });

  return NextResponse.json({ registration }, { status: 201 });
}

/**
 * DELETE /api/events/[id]/register
 * Unregister the current user from an event. Requires authentication.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const existing = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId: authResult.user.id, eventId: id } },
  });

  if (!existing || existing.status === "CANCELLED") {
    return NextResponse.json({ error: "Pas d'inscription trouvée" }, { status: 404 });
  }

  await prisma.eventRegistration.update({
    where: { id: existing.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
}
