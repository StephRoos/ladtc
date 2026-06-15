import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { galleryPhotoSchema } from "@/lib/schemas";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { delLocal } from "@/lib/storage";
import { isExternalVideo } from "@/lib/video-embed";

/**
 * PATCH /api/admin/gallery/[id]
 * Update gallery photo metadata. Restricted to COMMITTEE and ADMIN.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

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

  // An empty-string albumId means "remove from album"; a non-empty one must
  // reference an existing album. `undefined` leaves the current album untouched.
  let nextAlbumId = existing.albumId;
  if (parsed.data.albumId !== undefined) {
    if (parsed.data.albumId === "") {
      nextAlbumId = null;
    } else {
      const album = await prisma.galleryAlbum.findUnique({
        where: { id: parsed.data.albumId },
        select: { id: true },
      });
      if (!album) {
        return NextResponse.json({ error: "Album introuvable" }, { status: 422 });
      }
      nextAlbumId = parsed.data.albumId;
    }
  }

  const photo = await prisma.galleryPhoto.update({
    where: { id },
    data: {
      title: parsed.data.title ?? existing.title,
      description: parsed.data.description ?? existing.description,
      category: parsed.data.category ?? existing.category,
      albumId: nextAlbumId,
    },
    include: {
      uploadedBy: { select: { id: true, name: true } },
      album: true,
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
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const existing = await prisma.galleryPhoto.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
  }

  // Only local uploads have a file to remove; external embeds (YouTube/Vimeo)
  // just hold a URL.
  if (!isExternalVideo(existing.url)) {
    await delLocal(existing.url);
  }
  await prisma.galleryPhoto.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
