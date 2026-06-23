"use client";

import { SponsorsCarousel } from "@/components/sponsors/SponsorsCarousel";
import { usePublicSponsors } from "@/hooks/use-sponsors";

/**
 * Sponsors section for UTC page - client component that fetches and displays sponsors
 */
export function UtcSponsorsSection(): React.ReactNode {
  const { data, isLoading, isError } = usePublicSponsors();

  // Loading state
  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Nos sponsors</h2>
            <p className="mt-2 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state or no sponsors
  if (isError || !data?.sponsors || data.sponsors.length === 0) {
    return null;
  }

  // Success - show sponsors carousel
  return (
    <section className="mb-16">
      <SponsorsCarousel
        sponsors={data.sponsors}
        title="Nos sponsors"
        autoplay={true}
        scrollSpeed={40}
      />
    </section>
  );
}