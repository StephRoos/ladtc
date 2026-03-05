import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/schemas";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/blog/posts/[id]
 * Returns a single blog post by ID (including drafts). Restricted to COMMITTEE and ADMIN.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

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
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

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

  const { featuredImageUrl, published, eventDate, eventLocation, ...rest } = parsed.data;

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

  if (eventDate !== undefined) {
    updateData.eventDate = eventDate ? new Date(eventDate) : null;
  }

  if (eventLocation !== undefined) {
    updateData.eventLocation = eventLocation || null;
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
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
