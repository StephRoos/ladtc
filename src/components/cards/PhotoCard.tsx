import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { GalleryPhoto } from "@/types";

interface PhotoCardProps {
  photo: GalleryPhoto;
  onClick: () => void;
}

/**
 * Gallery photo card — displays image, title, and category badge. Click opens lightbox.
 */
export function PhotoCard({ photo, onClick }: PhotoCardProps): React.ReactNode {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
    >
      <div className="overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 group-hover:border-primary/40">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={photo.url}
            alt={photo.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
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
