import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError, COMMITTEE_ROLES } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/schemas";
import { getCurrentSeason } from "@/lib/membership";
import { getEquipmentShippingFee } from "@/lib/settings";
import { z } from "zod";

const createOrderSchema = checkoutSchema.and(
  z.object({
    items: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().int().positive(),
          size: z.string().min(1, "Taille requise"),
        })
      )
      .min(1, "Le panier est vide"),
  })
);

/**
 * GET /api/orders
 * Members see their own orders. Admins/committee see all orders.
 *
 * Query params (admin only):
 *   - status: OrderStatus filter
 *   - page: number (default: 1)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const isAdmin = COMMITTEE_ROLES.includes(authResult.user.role);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const take = 20;
  const skip = (page - 1) * take;

  const validStatuses = ["PENDING", "BATCHED", "ORDERED", "RECEIVED", "DELIVERED", "CANCELLED"] as const;
  const statusFilter =
    status && validStatuses.includes(status as (typeof validStatuses)[number])
      ? (status as (typeof validStatuses)[number])
      : undefined;

  const where = {
    ...(isAdmin ? {} : { userId: authResult.user.id }),
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
 * Workflow (Issue #16 sprint 2):
 *  - If ALL items are available in ProductStock (matching size + sufficient quantity),
 *    the order is created with status RECEIVED and the stock is decremented atomically.
 *  - Otherwise, the order is created with status PENDING and joins the next batch
 *    (admin groups + orders from supplier later).
 *
 * Delivery method gates the shipping fields:
 *  - HOME_DELIVERY: shipping fields validated by checkoutSchema
 *  - CLUB_PICKUP: shipping fields ignored (member picks up at the club)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  // Membership check: only members with active subscription for current season can order
  const membership = await prisma.membership.findUnique({
    where: { userId: authResult.user.id },
  });

  if (!membership || membership.status !== "ACTIVE" || membership.season !== getCurrentSeason()) {
    return NextResponse.json(
      { error: "Commandes réservées aux membres à jour de cotisation" },
      { status: 403 }
    );
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

  const { items, deliveryMethod, ...shippingData } = parsed.data;

  // Validate products exist and are active
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    include: { productStock: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "Un ou plusieurs produits sont introuvables ou indisponibles" },
      { status: 422 }
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validate each item's size against the product's catalog of available sizes
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    if (!product.sizes.includes(item.size)) {
      return NextResponse.json(
        { error: `Taille ${item.size} non disponible pour ${product.name}` },
        { status: 422 }
      );
    }
  }

  // Determine if every item can be fulfilled directly from existing per-size stock.
  // If yes, status = RECEIVED and stock is decremented in a transaction.
  // If no (any item missing or insufficient stock), status = PENDING (grouped order workflow).
  let allInStock = true;
  for (const item of items) {
    const product = productMap.get(item.productId)!;
    const stockRow = product.productStock.find((s) => s.size === item.size);
    if (!stockRow || stockRow.quantity < item.quantity) {
      allInStock = false;
      break;
    }
  }

  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      price: product.price,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Shipping fee is admin-tunable via the Setting table. CLUB_PICKUP is always free.
  const shippingCost =
    deliveryMethod === "HOME_DELIVERY" ? await getEquipmentShippingFee() : 0;
  const tax = 0;
  const total = subtotal + shippingCost + tax;

  // CLUB_PICKUP clears any address fields that may have been sent — they're not used
  // for this delivery method and storing them would muddle the order display.
  const orderShipping =
    deliveryMethod === "CLUB_PICKUP"
      ? {
          shippingName: null,
          shippingEmail: null,
          shippingPhone: null,
          shippingAddress: null,
          shippingCity: null,
          shippingZip: null,
          shippingCountry: null,
        }
      : shippingData;

  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock atomically only if everything is in stock; otherwise the order
    // joins the grouped workflow with status PENDING and stock is untouched.
    if (allInStock) {
      for (const item of items) {
        await tx.productStock.update({
          where: { productId_size: { productId: item.productId, size: item.size } },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    return tx.order.create({
      data: {
        userId: authResult.user.id,
        deliveryMethod,
        ...orderShipping,
        subtotal,
        shippingCost,
        tax,
        total,
        status: allInStock ? "RECEIVED" : "PENDING",
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
  });

  return NextResponse.json({ order, orderId: order.id }, { status: 201 });
}
