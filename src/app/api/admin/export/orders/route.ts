import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCsv } from "@/lib/csv";

const ALLOWED_ROLES = ["COMMITTEE", "ADMIN"] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

/**
 * GET /api/admin/export/orders
 * Exports all orders as CSV. Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ALLOWED_ROLES.includes(userRole as (typeof ALLOWED_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

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
      order.paidAt ? new Date(order.paidAt).toLocaleDateString("fr-BE") : "",
      order.shippingAddress,
      order.shippingCity,
      order.shippingZip,
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
