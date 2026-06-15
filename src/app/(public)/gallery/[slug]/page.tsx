"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { useGalleryAlbum } from "@/hooks/use-gallery-albums";

function formatAlbumDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Album detail page — header (name, date, description) and the album's photos
 * in a grid with a fullscreen lightbox.
 */
export default function AlbumPage(): React.ReactNode {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data: album, isLoading, isError } = useGalleryAlbum(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link
        href="/gallery"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour à la galerie
      </Link>

      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-9 w-1/2" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
          <p className="font-medium text-destructive">Album introuvable</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cet album n&apos;existe pas ou a été supprimé.
          </p>
        </div>
      )}

      {album && (
        <>
          <div className="mb-8">
            <h1 className="text-4xl font-bold">{album.name}</h1>
            {formatAlbumDate(album.date) && (
              <p className="mt-2 text-muted-foreground">
                {formatAlbumDate(album.date)}
              </p>
            )}
            {album.description && (
              <p className="mt-3 max-w-2xl text-muted-foreground">
                {album.description}
              </p>
            )}
          </div>

          <PhotoGrid photos={album.photos} />
        </>
      )}
    </div>
  );
}
