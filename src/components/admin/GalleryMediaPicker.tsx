"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Play, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGallery } from "@/hooks/use-gallery";
import type { GalleryPhoto } from "@/types";

interface GalleryMediaPickerProps {
  /** Called with the chosen media when the user picks an item. */
  onSelect: (media: GalleryPhoto) => void;
  /** Optional custom trigger label. */
  label?: string;
}

/**
 * Dialog that lets an editor pick an existing gallery item (image or video)
 * to insert elsewhere — e.g. into a blog article body.
 *
 * Pulls the first 50 gallery items. Videos show a play overlay; the caller
 * decides what to do with the selected media (see BlogPostForm insertion).
 */
export function GalleryMediaPicker({
  onSelect,
  label = "Insérer un média de la galerie",
}: GalleryMediaPickerProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGallery(1, 50);

  function handlePick(media: GalleryPhoto): void {
    onSelect(media);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <ImagePlus className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Galerie — choisir un média</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data?.photos && data.photos.length > 0 ? (
          <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
            {data.photos.map((media) => (
              <button
                key={media.id}
                type="button"
                onClick={() => handlePick(media)}
                title={media.title}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border transition-all hover:border-primary hover:ring-2 hover:ring-primary/20"
              >
                {media.mediaType === "VIDEO" ? (
                  <>
                    <video
                      src={media.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                      <Play className="h-5 w-5 fill-current" />
                    </span>
                  </>
                ) : (
                  <Image
                    src={media.url}
                    alt={media.title}
                    fill
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border p-6 text-center text-sm text-muted-foreground">
            Aucun média dans la galerie.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
