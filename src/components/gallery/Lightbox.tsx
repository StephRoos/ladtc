"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { parseVideoEmbed } from "@/lib/video-embed";
import type { GalleryPhoto } from "@/types";

interface LightboxProps {
  photos: GalleryPhoto[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Fullscreen photo/video viewer with keyboard navigation, shared by the gallery
 * landing and the album detail page.
 */
export function Lightbox({
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

        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-50 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
        >
          <X className="h-5 w-5" />
        </button>

        {currentIndex > 0 && (
          <button
            onClick={onPrevious}
            className="absolute left-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {currentIndex < photos.length - 1 && (
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        <div className="relative flex min-h-[50vh] items-center justify-center">
          {(() => {
            const embed = parseVideoEmbed(photo.url);
            if (embed) {
              return (
                <div className="aspect-video w-full">
                  <iframe
                    key={photo.url}
                    src={embed.embedUrl}
                    title={photo.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }
            if (photo.mediaType === "VIDEO") {
              return (
                <video
                  key={photo.url}
                  src={photo.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] w-auto"
                />
              );
            }
            return (
              <Image
                src={photo.url}
                alt={photo.title}
                width={1200}
                height={800}
                className="max-h-[80vh] w-auto object-contain"
                priority
              />
            );
          })()}
        </div>

        <div className="px-6 pb-4 pt-2">
          <h3 className="text-lg font-semibold text-white">{photo.title}</h3>
          {photo.description && (
            <p className="mt-1 text-sm text-gray-300">{photo.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            {photo.category && (
              <Badge variant="secondary" className="bg-white/10 text-white text-xs">
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
