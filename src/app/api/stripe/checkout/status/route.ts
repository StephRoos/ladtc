import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

/**
 * GET /api/stripe/checkout/status?session_id=xxx
 * Returns the order ID and payment status for a Stripe session.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id requis" }, { status: 400 });
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);

    const orderId = checkoutSession.metadata?.orderId ?? null;
    const paid = checkoutSession.payment_status === "paid";

    return NextResponse.json({
      orderId,
      status: checkoutSession.status,
      paid,
    });
  } catch {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }
}
