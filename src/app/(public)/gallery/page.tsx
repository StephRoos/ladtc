"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PhotoCard } from "@/components/cards/PhotoCard";
import { useGallery } from "@/hooks/use-gallery";
import type { GalleryPhoto } from "@/types";

const PER_PAGE = 12;

function GallerySkeleton(): React.ReactNode {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: PER_PAGE }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

interface LightboxProps {
  photos: GalleryPhoto[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

function Lightbox({
  photos,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
}: LightboxProps): React.ReactNode {
  const photo = photos[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onPrevious();
      else if (e.key === "ArrowRight") onNext();
    },
    [onPrevious, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!photo) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl border-none bg-black/95 p-0 sm:rounded-lg [&>button]:hidden">
        <DialogTitle className="sr-only">{photo.title}</DialogTitle>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-50 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Previous button */}
        {currentIndex > 0 && (
          <button
            onClick={onPrevious}
            className="absolute left-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Next button */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Image */}
        <div className="relative flex min-h-[50vh] items-center justify-center">
          <Image
            src={photo.url}
            alt={photo.title}
            width={1200}
            height={800}
            className="max-h-[80vh] w-auto object-contain"
            priority
          />
        </div>

        {/* Caption */}
        <div className="px-6 pb-4 pt-2">
          <h3 className="text-lg font-semibold text-white">{photo.title}</h3>
          {photo.description && (
            <p className="mt-1 text-sm text-gray-300">{photo.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            {photo.category && (
              <Badge
                variant="secondary"
                className="bg-white/10 text-white text-xs"
              >
                {photo.category}
              </Badge>
            )}
            <span>
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Public gallery page — responsive photo grid with category filters, pagination, and lightbox.
 */
export default function GalleryPage(): React.ReactNode {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data, isLoading, isError } = useGallery(
    page,
    PER_PAGE,
    selectedCategory
  );

  function handleCategoryChange(category: string | undefined): void {
    setSelectedCategory(category);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Galerie photos</h1>
        <p className="mt-2 text-muted-foreground">
          Les moments forts du club en images
        </p>
      </div>

      {/* Category filters */}
      {data?.categories && data.categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(undefined)}
          >
            Toutes
          </Button>
          {data.categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {isLoading && <GallerySkeleton />}

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
          <p className="font-medium text-destructive">
            Impossible de charger les photos
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Veuillez vérifier votre connexion et réessayer.
          </p>
        </div>
      )}

      {data && (
        <>
          {data.photos.length === 0 ? (
            <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
              Aucune photo dans cette catégorie.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.photos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => setLightboxIndex(index)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} sur {data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page === data.totalPages}
              >
                Suivant →
              </Button>
            </div>
          )}

          {/* Lightbox */}
          {lightboxIndex !== null && (
            <Lightbox
              photos={data.photos}
              currentIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onPrevious={() =>
                setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))
              }
              onNext={() =>
                setLightboxIndex((i) =>
                  Math.min(data.photos.length - 1, (i ?? 0) + 1)
                )
              }
            />
          )}
        </>
      )}
    </div>
  );
}
