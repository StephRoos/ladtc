import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/schemas";

const ADMIN_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * GET /api/admin/blog/posts
 * Returns all blog posts (including drafts). Restricted to COMMITTEE and ADMIN.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ADMIN_ROLES.includes(userRole as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

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

  const parsed = blogPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { featuredImageUrl, published, ...rest } = parsed.data;

  const post = await prisma.blogPost.create({
    data: {
      ...rest,
      featuredImageUrl: featuredImageUrl && featuredImageUrl.length > 0 ? featuredImageUrl : null,
      tags: rest.tags ?? [],
      published: published ?? false,
      publishedAt: published ? new Date() : null,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
