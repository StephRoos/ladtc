"use client";

import Image from "next/image";
import { useGallery } from "@/hooks/use-gallery";
import { siteConfig } from "@/config/site";

const utc = siteConfig.utc;

/**
 * Banner illustration for the /utc page — shows the most recent gallery photo
 * tagged with the UTC category (siteConfig.utc.galleryCategory) as a wide
 * header image. Renders nothing while loading or when no photo is tagged.
 */
export function UtcBanner(): React.ReactNode {
  const { data } = useGallery(1, 1, utc.galleryCategory);
  const photo = data?.photos?.[0];

  if (!photo) {
    return null;
  }

  return (
    <div className="mb-10 overflow-hidden rounded-lg border border-border bg-muted">
      <div className="relative aspect-[21/9] w-full">
        {photo.mediaType === "VIDEO" ? (
          <video
            src={photo.url}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <Image
            src={photo.url}
            alt={photo.title || `Illustration ${utc.shortName}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        )}
      </div>
    </div>
  );
}
