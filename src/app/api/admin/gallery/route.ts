import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { galleryPhotoSchema } from "@/lib/schemas";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { putLocal } from "@/lib/storage";
import { validateMediaFile } from "@/lib/media";
import { parseVideoEmbed, resolveDirectVideoUrl } from "@/lib/video-embed";

/**
 * GET /api/admin/gallery
 * Returns all gallery photos. Restricted to COMMITTEE and ADMIN.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const photos = await prisma.galleryPhoto.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { id: true, name: true } },
      album: true,
    },
  });

  return NextResponse.json({ photos });
}

/**
 * POST /api/admin/gallery
 * Upload a new gallery photo. Receives FormData with file + metadata.
 * Restricted to COMMITTEE and ADMIN.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  try {
    // Parsing a large multipart body can throw (e.g. body/size limits) — keep it
    // inside the try so the client gets a JSON error instead of an empty 500.
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const embedUrl = (formData.get("embedUrl") as string | null)?.trim() || null;

    if (!file && !embedUrl) {
      return NextResponse.json(
        { error: "Aucun fichier ni lien vidéo fourni" },
        { status: 400 }
      );
    }

    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const category = formData.get("category") as string | null;
    const albumId = formData.get("albumId") as string | null;

    const parsed = galleryPhotoSchema.safeParse({
      title: title ?? "",
      description: description || undefined,
      category: category || undefined,
      albumId: albumId || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    // Reject an unknown album id rather than silently filing the photo nowhere.
    if (parsed.data.albumId) {
      const album = await prisma.galleryAlbum.findUnique({
        where: { id: parsed.data.albumId },
        select: { id: true },
      });
      if (!album) {
        return NextResponse.json({ error: "Album introuvable" }, { status: 422 });
      }
    }

    // Resolve the media: an external YouTube/Vimeo link (no upload, dodges the
    // 100 MB ceiling) or a locally-stored file.
    let url: string;
    let mediaType: "IMAGE" | "VIDEO";
    if (embedUrl) {
      // Accept a YouTube/Vimeo embed, or a self-hosted direct video link
      // (Nextcloud share / NAS HTTPS file). Nextcloud shares are normalised to
      // their download endpoint so they stream in a <video> tag.
      if (parseVideoEmbed(embedUrl)) {
        url = embedUrl;
      } else {
        const direct = resolveDirectVideoUrl(embedUrl);
        if (!direct) {
          return NextResponse.json(
            {
              error:
                "Lien vidéo non reconnu (YouTube, Vimeo, lien de partage Nextcloud, ou URL HTTPS .mp4 attendus)",
            },
            { status: 422 }
          );
        }
        url = direct;
      }
      mediaType = "VIDEO";
    } else {
      // Type + per-kind size validation (images 5 MB, videos 100 MB)
      const validation = validateMediaFile(file as File);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
      }
      const result = await putLocal(file as File, "gallery");
      url = result.url;
      mediaType = validation.kind;
    }

    const photo = await prisma.galleryPhoto.create({
      data: {
        url,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        category: parsed.data.category ?? null,
        albumId: parsed.data.albumId || null,
        mediaType,
        uploadedById: authResult.user.id,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
        album: true,
      },
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (err) {
    // Surface the real cause: logged for Sentry/container logs, and returned in
    // the response (admin-only endpoint) so failures are diagnosable.
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[gallery upload] échec:", err);
    return NextResponse.json(
      { error: `Échec de l'upload : ${message}` },
      { status: 500 }
    );
  }
}
