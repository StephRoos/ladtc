import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCsv } from "@/lib/csv";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  BATCHED: "Groupée",
  ORDERED: "Commandée",
  RECEIVED: "Reçue",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const DELIVERY_LABELS: Record<string, string> = {
  HOME_DELIVERY: "Livraison",
  CLUB_PICKUP: "Retrait au club",
};

/**
 * GET /api/admin/export/orders
 * Exports all orders as CSV. Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "ID",
    "Date",
    "Membre",
    "Email",
    "Articles",
    "Sous-total",
    "Total",
    "Statut",
    "Mode de livraison",
    "Payé le",
    "Adresse",
    "Ville",
    "Code postal",
    "N° suivi",
  ];

  const rows = orders.map((order) => {
    const articles = order.items
      .map((item) => {
        const size = item.size ? ` (${item.size})` : "";
        return `${item.product.name}${size} x${item.quantity}`;
      })
      .join(", ");

    return [
      order.id.slice(-8).toUpperCase(),
      new Date(order.createdAt).toLocaleDateString("fr-BE"),
      order.user.name ?? "",
      order.user.email,
      articles,
      order.subtotal.toFixed(2),
      order.total.toFixed(2),
      STATUS_LABELS[order.status] ?? order.status,
      DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod,
      order.paidAt ? new Date(order.paidAt).toLocaleDateString("fr-BE") : "",
      order.shippingAddress ?? "",
      order.shippingCity ?? "",
      order.shippingZip ?? "",
      order.trackingNumber ?? "",
    ];
  });

  const csv = generateCsv(headers, rows);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `commandes-ladtc-${today}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
