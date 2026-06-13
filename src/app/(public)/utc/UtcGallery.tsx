"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGallery } from "@/hooks/use-gallery";
import { siteConfig } from "@/config/site";

const utc = siteConfig.utc;

/**
 * "En images" section for the /utc page — illustrates the race with photos
 * pulled from the gallery, filtered on the UTC category (siteConfig.utc.
 * galleryCategory). Renders nothing while loading or when no photo is tagged,
 * so the section never shows up empty.
 */
export function UtcGallery(): React.ReactNode {
  const { data } = useGallery(1, 6, utc.galleryCategory);
  const photos = data?.photos ?? [];

  if (photos.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">L&apos;{utc.shortName} en images</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/gallery">Voir la galerie</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <Link
            key={photo.id}
            href="/gallery"
            className="group relative block aspect-square overflow-hidden rounded-lg border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {photo.mediaType === "VIDEO" ? (
              <>
                <video
                  src={photo.url}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  muted
                  playsInline
                  preload="metadata"
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white">
                    <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                  </span>
                </span>
              </>
            ) : (
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
