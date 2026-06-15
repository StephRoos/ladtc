"use client";

import { useState } from "react";
import { PhotoCard } from "@/components/cards/PhotoCard";
import { Lightbox } from "@/components/gallery/Lightbox";
import type { GalleryPhoto } from "@/types";

interface PhotoGridProps {
  photos: GalleryPhoto[];
}

/**
 * Responsive photo grid that opens a fullscreen lightbox on click.
 * Self-contained (owns the lightbox index), so it can be dropped into the
 * gallery landing's "unfiled" section or an album detail page alike.
 */
export function PhotoGrid({ photos }: PhotoGridProps): React.ReactNode {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
        Aucune photo pour le moment.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => setLightboxIndex(index)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrevious={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() =>
            setLightboxIndex((i) => Math.min(photos.length - 1, (i ?? 0) + 1))
          }
        />
      )}
    </>
  );
}
