import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/schemas";
import { z } from "zod";

const ADMIN_ROLES = ["COMMITTEE", "ADMIN"] as const;

const createOrderSchema = checkoutSchema.extend({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      size: z.string().optional(),
    })
  ).min(1, "Le panier est vide"),
});

/**
 * GET /api/orders
 * Members see their own orders. Admins/committee see all orders.
 *
 * Query params (admin only):
 *   - status: OrderStatus filter
 *   - page: number (default: 1)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  const isAdmin = ADMIN_ROLES.includes(userRole as (typeof ADMIN_ROLES)[number]);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const take = 20;
  const skip = (page - 1) * take;

  const validStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
  const statusFilter =
    status && validStatuses.includes(status as (typeof validStatuses)[number])
      ? (status as (typeof validStatuses)[number])
      : undefined;

  const where = {
    ...(isAdmin ? {} : { userId: session.user.id }),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, pages: Math.ceil(total / take), page });
}

/**
 * POST /api/orders
 * Creates a new order from cart items. Requires authentication.
 *
 * Body: { items: CartItem[], shippingName, shippingEmail, ... }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { items, ...shippingData } = parsed.data;

  // Fetch all products to validate prices and stock
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "Un ou plusieurs produits sont introuvables ou indisponibles" },
      { status: 422 }
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validate stock
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stock insuffisant pour ${product.name}` },
        { status: 422 }
      );
    }
  }

  // Calculate totals using actual prices
  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: item.productId,
      quantity: item.quantity,
      size: item.size ?? null,
      price: product.price,
    };
  });

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = 0;
  const tax = 0;
  const total = subtotal + shippingCost + tax;

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      ...shippingData,
      subtotal,
      shippingCost,
      tax,
      total,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: {
        include: { product: true },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ order, orderId: order.id }, { status: 201 });
}
