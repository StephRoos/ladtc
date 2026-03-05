import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/schemas";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/blog/posts
 * Returns all blog posts (including drafts). Restricted to COMMITTEE and ADMIN.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ posts });
}

/**
 * POST /api/admin/blog/posts
 * Creates a new blog post. Restricted to COMMITTEE and ADMIN.
 *
 * Body: { title, slug, content, excerpt, featuredImageUrl, category, tags, published }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = blogPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { featuredImageUrl, published, eventDate, eventLocation, ...rest } = parsed.data;

  const post = await prisma.blogPost.create({
    data: {
      ...rest,
      featuredImageUrl: featuredImageUrl && featuredImageUrl.length > 0 ? featuredImageUrl : null,
      tags: rest.tags ?? [],
      published: published ?? false,
      publishedAt: published ? new Date() : null,
      eventDate: eventDate ? new Date(eventDate) : null,
      eventLocation: eventLocation || null,
      authorId: authResult.user.id,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
