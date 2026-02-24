import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/blog/posts/[slug]
 * Returns a single published blog post by slug. Public endpoint.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  if (!post) {
    return NextResponse.json(
      { error: "Article introuvable" },
      { status: 404 }
    );
  }

  return NextResponse.json(post);
}
