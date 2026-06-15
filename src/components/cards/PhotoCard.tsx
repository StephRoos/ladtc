import Image from "next/image";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { parseVideoEmbed } from "@/lib/video-embed";
import type { GalleryPhoto } from "@/types";

interface PhotoCardProps {
  photo: GalleryPhoto;
  onClick: () => void;
}

/**
 * Gallery media card — displays an image (or a video first frame with a play
 * overlay), title, and category badge. Click opens the lightbox.
 *
 * Three media shapes: a local image, a local uploaded video (first frame as
 * poster), or an external YouTube/Vimeo video (provider thumbnail).
 */
export function PhotoCard({ photo, onClick }: PhotoCardProps): React.ReactNode {
  const embed = parseVideoEmbed(photo.url);
  const isVideo = photo.mediaType === "VIDEO" || embed !== null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
    >
      <div className="overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 group-hover:border-primary/40">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {isVideo ? (
            <>
              {embed ? (
                embed.thumbnailUrl ? (
                  <Image
                    src={embed.thumbnailUrl}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  // Vimeo: no poster without an API call — solid backdrop.
                  <div className="h-full w-full bg-muted" />
                )
              ) : (
                /* Local upload: preload=metadata shows the first frame as a
                   thumbnail without downloading the whole video. */
                <video
                  src={photo.url}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  muted
                  playsInline
                  preload="metadata"
                />
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white">
                  <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                </span>
              </div>
            </>
          ) : (
            <Image
              src={photo.url}
              alt={photo.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-1 text-sm font-medium text-foreground">
            {photo.title}
          </h3>
          {photo.category && (
            <Badge
              variant="secondary"
              className="mt-1 bg-primary/10 text-primary hover:bg-primary/20 text-xs"
            >
              {photo.category}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
