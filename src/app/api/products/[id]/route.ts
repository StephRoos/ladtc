import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/schemas";

const ADMIN_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * GET /api/products/[id]
 * Returns a single product by ID. Public endpoint.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { productStock: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

/**
 * PATCH /api/products/[id]
 * Partially updates a product. Restricted to COMMITTEE and ADMIN roles.
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

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { image, sizes, ...rest } = parsed.data;
  const updateData = {
    ...rest,
    ...(sizes !== undefined ? { sizes } : {}),
    ...(image !== undefined ? { image: image && image.length > 0 ? image : null } : {}),
  };

  // When the sizes list changes, sync ProductStock rows: create entries for new sizes
  // (quantity 0, admin sets the real value later) and delete entries for removed sizes.
  // Stock for sizes that are still present is preserved.
  const product = await prisma.$transaction(async (tx) => {
    if (sizes !== undefined) {
      const existingStock = await tx.productStock.findMany({ where: { productId: id } });
      const existingSizes = new Set(existingStock.map((s) => s.size));
      const newSizes = new Set(sizes);

      const sizesToAdd = sizes.filter((s) => !existingSizes.has(s));
      const sizesToRemove = [...existingSizes].filter((s) => !newSizes.has(s));

      if (sizesToAdd.length > 0) {
        await tx.productStock.createMany({
          data: sizesToAdd.map((size) => ({ productId: id, size, quantity: 0 })),
        });
      }
      if (sizesToRemove.length > 0) {
        await tx.productStock.deleteMany({
          where: { productId: id, size: { in: sizesToRemove } },
        });
      }
    }

    return tx.product.update({
      where: { id },
      data: updateData,
      include: { productStock: true },
    });
  });

  return NextResponse.json({ product });
}

/**
 * DELETE /api/products/[id]
 * Soft-deletes a product by setting active=false. Restricted to COMMITTEE and ADMIN roles.
 */
export async function DELETE(
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

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  await prisma.product.update({ where: { id }, data: { active: false } });

  return NextResponse.json({ success: true });
}
