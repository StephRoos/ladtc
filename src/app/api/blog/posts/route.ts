import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

/**
 * GET /api/blog/posts
 * Returns a paginated list of published blog posts. Public endpoint.
 *
 * Query params:
 *   - page: number (default: 1)
 *   - per_page: number (default: 10, max: 50)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(
    parseInt(searchParams.get("per_page") ?? String(PAGE_SIZE), 10),
    50
  );
  const skip = (page - 1) * perPage;

  const where = { published: true, publishedAt: { not: null } };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: perPage,
      include: {
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return NextResponse.json({
    posts,
    total,
    totalPages: Math.ceil(total / perPage),
  });
}
