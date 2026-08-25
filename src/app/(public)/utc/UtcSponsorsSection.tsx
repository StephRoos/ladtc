"use client";

import { SponsorsCarousel } from "@/components/sponsors/SponsorsCarousel";
import { usePublicSponsors } from "@/hooks/use-sponsors";

/**
 * Sponsors section for UTC page - client component that fetches and displays sponsors.
 * Hidden entirely (null) while loading and when there are no sponsors — showing
 * a "Chargement..." placeholder forever was worse than showing nothing, especially
 * before the first sponsor is signed up (audit 2026-07-20 §2.4).
 */
export function UtcSponsorsSection(): React.ReactNode {
  const { data, isLoading, isError } = usePublicSponsors();

  // Loading or no sponsors: render nothing. The section only appears once
  // sponsors are actually loaded and the list is non-empty.
  if (isLoading || isError || !data?.sponsors || data.sponsors.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <SponsorsCarousel
        sponsors={data.sponsors}
        title="Nos sponsors"
        autoplay={true}
        scrollSpeed={120}
      />
    </section>
  );
}