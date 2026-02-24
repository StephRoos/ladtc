import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/schemas";

const ADMIN_ROLES = ["COMMITTEE", "ADMIN"] as const;
const PAGE_SIZE = 20;

/**
 * GET /api/products
 * Returns a paginated list of products. Public endpoint.
 *
 * Query params:
 *   - active: "true" | "false" (default: "true")
 *   - skip: number (default: 0)
 *   - take: number (default: 20)
 *   - sort: "price_asc" | "price_desc" | "name" (default: "name")
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const activeParam = searchParams.get("active");
  const skip = parseInt(searchParams.get("skip") ?? "0", 10);
  const take = Math.min(parseInt(searchParams.get("take") ?? String(PAGE_SIZE), 10), 100);
  const sort = searchParams.get("sort") ?? "name";

  const activeFilter = activeParam === "false" ? false : true;

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : { name: "asc" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { active: activeFilter },
      orderBy,
      skip: Math.max(0, skip),
      take,
    }),
    prisma.product.count({ where: { active: activeFilter } }),
  ]);

  return NextResponse.json({ products, total });
}

/**
 * POST /api/products
 * Creates a new product. Restricted to COMMITTEE and ADMIN roles.
 *
 * Body: { name, description, price, sizes, stock, image, sku }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ADMIN_ROLES.includes(userRole as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { image, ...rest } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...rest,
      image: image && image.length > 0 ? image : null,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
