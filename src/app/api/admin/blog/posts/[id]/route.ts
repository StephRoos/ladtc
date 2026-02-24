import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/schemas";

const ADMIN_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * GET /api/admin/blog/posts/[id]
 * Returns a single blog post by ID (including drafts). Restricted to COMMITTEE and ADMIN.
 */
export async function GET(
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

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

/**
 * PATCH /api/admin/blog/posts/[id]
 * Partially updates a blog post. Restricted to COMMITTEE and ADMIN.
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

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = blogPostSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { featuredImageUrl, published, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = { ...rest };

  if (featuredImageUrl !== undefined) {
    updateData.featuredImageUrl = featuredImageUrl && featuredImageUrl.length > 0 ? featuredImageUrl : null;
  }

  if (published !== undefined) {
    updateData.published = published;
    if (published && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
    if (!published) {
      updateData.publishedAt = null;
    }
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ post });
}

/**
 * DELETE /api/admin/blog/posts/[id]
 * Permanently deletes a blog post. Restricted to COMMITTEE and ADMIN.
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

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
