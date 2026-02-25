import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

/**
 * GET /api/gallery
 * Returns a paginated list of gallery photos. Public endpoint.
 *
 * Query params:
 *   - page: number (default: 1)
 *   - per_page: number (default: 12, max: 50)
 *   - category: string (optional, filters by category)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(
    parseInt(searchParams.get("per_page") ?? String(PAGE_SIZE), 10),
    50
  );
  const skip = (page - 1) * perPage;
  const category = searchParams.get("category")?.trim();

  const where: Record<string, unknown> = {};
  if (category && category.length > 0) {
    where.category = category;
  }

  const [photos, total, categories] = await Promise.all([
    prisma.galleryPhoto.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.galleryPhoto.count({ where }),
    prisma.galleryPhoto.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  return NextResponse.json({
    photos,
    total,
    totalPages: Math.ceil(total / perPage),
    categories: categories
      .map((c) => c.category)
      .filter((c): c is string => c !== null),
  });
}
