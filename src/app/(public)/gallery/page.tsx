"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AlbumCard } from "@/components/gallery/AlbumCard";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { useGalleryAlbums } from "@/hooks/use-gallery-albums";
import { useGallery } from "@/hooks/use-gallery";

function AlbumGridSkeleton(): React.ReactNode {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/**
 * Public gallery landing — albums first (event folders), then a fallback
 * section listing photos that are not filed in any album yet.
 */
export default function GalleryPage(): React.ReactNode {
  const { data: albums, isLoading, isError } = useGalleryAlbums();
  // Up to 50 unfiled photos shown inline under "Autres photos".
  const { data: unfiledData } = useGallery(1, 50, undefined, true);
  const unfiledPhotos = unfiledData?.photos ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Galerie photos</h1>
        <p className="mt-2 text-muted-foreground">
          Les moments forts du club, classés par événement
        </p>
      </div>

      {isLoading && <AlbumGridSkeleton />}

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
          <p className="font-medium text-destructive">
            Impossible de charger la galerie
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Veuillez vérifier votre connexion et réessayer.
          </p>
        </div>
      )}

      {albums && (
        <>
          {albums.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            unfiledPhotos.length === 0 && (
              <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
                Aucun album pour le moment.
              </div>
            )
          )}

          {unfiledPhotos.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold">Autres photos</h2>
              <PhotoGrid photos={unfiledPhotos} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
