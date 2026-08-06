import Image from "next/image";
import { siteConfig } from "@/config/site";

const utc = siteConfig.utc;

/**
 * Banner illustration for the /utc page — official UTC 4 visual, served as a
 * static asset (public/images/utc4-banner.jpg). Server component: no client
 * fetch, rendered directly in the HTML.
 */
export function UtcBanner(): React.ReactNode {
  return (
    <div className="mb-10 overflow-hidden rounded-lg border border-border bg-muted">
      {/* 2048×1070 source image — container matches its aspect ratio so the
          full banner is visible (no cropping from object-cover). */}
      <div className="relative aspect-[2048/1070] w-full">
        <Image
          src="/images/utc4-banner.jpg"
          alt={`Bannière officielle de l'${utc.name} (${utc.shortName})`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
      </div>
    </div>
  );
}
