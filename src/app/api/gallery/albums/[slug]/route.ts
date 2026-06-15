import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/gallery/albums/[slug]
 * Returns a single album with its photos, ordered most recent first.
 * Public endpoint. Returns 404 when the slug does not exist.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  const album = await prisma.galleryAlbum.findUnique({
    where: { slug },
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!album) {
    return NextResponse.json({ error: "Album introuvable" }, { status: 404 });
  }

  return NextResponse.json({ album });
}
