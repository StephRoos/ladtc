import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireCommittee, isAuthError, COMMITTEE_ROLES } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { orderUpdateSchema } from "@/lib/schemas";

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

  // Set timestamp fields based on status transitions
  // Note: granular batchedAt / orderedAt / receivedAt columns will be added in sprint 2.
  if (parsed.data.status === "ORDERED" && !existing.shippedAt) {
    updateData.shippedAt = new Date();
  }
  if (parsed.data.status === "DELIVERED" && !existing.deliveredAt) {
    updateData.deliveredAt = new Date();
  }

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: { product: true },
      },
    },
  });

  return NextResponse.json({ order });
}
