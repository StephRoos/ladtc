import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { GalleryAlbumSummary } from "@/types";

/**
 * GET /api/gallery/albums
 * Returns all gallery albums (event folders) with a derived cover image and a
 * photo count, ordered most recent first. Public endpoint.
 *
 * The cover is the album's most recent photo — no dedicated cover relation, so
 * an album always shows an up-to-date thumbnail without extra bookkeeping.
 */
export async function GET(): Promise<NextResponse> {
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { photos: true } },
      photos: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { url: true, mediaType: true },
      },
    },
  });

  const summaries: GalleryAlbumSummary[] = albums.map((album) => ({
    id: album.id,
    name: album.name,
    slug: album.slug,
    description: album.description,
    date: album.date ? album.date.toISOString() : null,
    createdAt: album.createdAt.toISOString(),
    updatedAt: album.updatedAt.toISOString(),
    photoCount: album._count.photos,
    coverUrl: album.photos[0]?.url ?? null,
    coverMediaType: album.photos[0]?.mediaType ?? null,
  }));

  return NextResponse.json({ albums: summaries });
}
