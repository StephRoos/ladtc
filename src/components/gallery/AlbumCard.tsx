"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { GalleryAlbumSummary } from "@/types";

interface AlbumCardProps {
  album: GalleryAlbumSummary;
}

function formatAlbumDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Folder-style card for an event album: cover thumbnail (derived from the most
 * recent photo), name, optional date and photo count. Links to the album page.
 */
export function AlbumCard({ album }: AlbumCardProps): React.ReactNode {
  const date = formatAlbumDate(album.date);

  return (
    <Link
      href={`/gallery/${album.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {album.coverUrl ? (
          album.coverMediaType === "VIDEO" ? (
            <video
              src={album.coverUrl}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={album.coverUrl}
              alt={album.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
          {album.photoCount} {album.photoCount > 1 ? "photos" : "photo"}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-semibold leading-tight group-hover:text-primary">
          {album.name}
        </h3>
        {date && <p className="mt-1 text-xs text-muted-foreground">{date}</p>}
      </div>
    </Link>
  );
}
