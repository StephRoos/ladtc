import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { galleryAlbumSchema } from "@/lib/schemas";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";

/**
 * PATCH /api/admin/gallery/albums/[id]
 * Update an album's name, description or date. Restricted to COMMITTEE.
 *
 * The slug is intentionally left unchanged on rename so existing shared links
 * (/gallery/<slug>) keep working.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const existing = await prisma.galleryAlbum.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Album introuvable" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = galleryAlbumSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const album = await prisma.galleryAlbum.update({
    where: { id },
    data: {
      name: parsed.data.name ?? existing.name,
      description:
        parsed.data.description !== undefined
          ? parsed.data.description || null
          : existing.description,
      date:
        parsed.data.date !== undefined
          ? parsed.data.date
            ? new Date(parsed.data.date)
            : null
          : existing.date,
    },
  });

  return NextResponse.json({ album });
}

/**
 * DELETE /api/admin/gallery/albums/[id]
 * Delete an album. Its photos are kept and become unfiled (albumId set to null
 * by the schema's onDelete: SetNull). Restricted to COMMITTEE.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const existing = await prisma.galleryAlbum.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Album introuvable" }, { status: 404 });
  }

  await prisma.galleryAlbum.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
