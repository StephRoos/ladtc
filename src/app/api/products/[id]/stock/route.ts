import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productStockUpdateSchema } from "@/lib/schemas";

const ADMIN_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * PATCH /api/products/[id]/stock
 * Sets per-size stock quantities for a product. Restricted to COMMITTEE and ADMIN.
 *
 * Body: { stock: [{ size: "M", quantity: 3 }, { size: "L", quantity: 0 }, ...] }
 *
 * Each size must be present in the product's `sizes` array. Existing ProductStock
 * rows are upserted; sizes not mentioned in the payload are left untouched.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ADMIN_ROLES.includes(userRole as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = productStockUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const availableSizes = new Set(product.sizes);
  const invalidSizes = parsed.data.stock
    .map((s) => s.size)
    .filter((size) => !availableSizes.has(size));
  if (invalidSizes.length > 0) {
    return NextResponse.json(
      { error: `Tailles non disponibles pour ce produit : ${invalidSizes.join(", ")}` },
      { status: 422 }
    );
  }

  await prisma.$transaction(
    parsed.data.stock.map((entry) =>
      prisma.productStock.upsert({
        where: { productId_size: { productId: id, size: entry.size } },
        update: { quantity: entry.quantity },
        create: { productId: id, size: entry.size, quantity: entry.quantity },
      })
    )
  );

  const updated = await prisma.product.findUnique({
    where: { id },
    include: { productStock: true },
  });

  return NextResponse.json({ product: updated });
}
