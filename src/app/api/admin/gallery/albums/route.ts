import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { galleryAlbumSchema } from "@/lib/schemas";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { slugify } from "@/lib/utils";

/**
 * GET /api/admin/gallery/albums
 * Returns all albums with their photo counts. Restricted to COMMITTEE.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const albums = await prisma.galleryAlbum.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { photos: true } } },
  });

  return NextResponse.json({
    albums: albums.map((a) => ({ ...a, photoCount: a._count.photos })),
  });
}

/**
 * Build a slug that is unique across albums by appending a numeric suffix when
 * the base slug already exists (e.g. "utc-3", "utc-3-2").
 */
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "album";
  let slug = base;
  let n = 1;
  while (await prisma.galleryAlbum.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

/**
 * POST /api/admin/gallery/albums
 * Create a new album (event folder). Restricted to COMMITTEE.
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

  const parsed = galleryAlbumSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const album = await prisma.galleryAlbum.create({
    data: {
      name: parsed.data.name,
      slug: await uniqueSlug(parsed.data.name),
      description: parsed.data.description || null,
      date: parsed.data.date ? new Date(parsed.data.date) : null,
    },
  });

  return NextResponse.json({ album }, { status: 201 });
}
