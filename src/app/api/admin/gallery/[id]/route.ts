import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { galleryPhotoSchema } from "@/lib/schemas";
import { del } from "@vercel/blob";

const ADMIN_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * PATCH /api/admin/gallery/[id]
 * Update gallery photo metadata. Restricted to COMMITTEE and ADMIN.
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

  const existing = await prisma.galleryPhoto.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = galleryPhotoSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const photo = await prisma.galleryPhoto.update({
    where: { id },
    data: {
      ...parsed.data,
      description: parsed.data.description ?? existing.description,
      category: parsed.data.category ?? existing.category,
    },
    include: {
      uploadedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ photo });
}

/**
 * DELETE /api/admin/gallery/[id]
 * Delete a gallery photo (blob + database). Restricted to COMMITTEE and ADMIN.
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

  const existing = await prisma.galleryPhoto.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
  }

  await del(existing.url);
  await prisma.galleryPhoto.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
