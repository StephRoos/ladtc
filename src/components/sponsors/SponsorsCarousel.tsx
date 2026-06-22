"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponsorCard } from "./SponsorCard";
import type { Sponsor } from "@/types/sponsor";

interface SponsorsCarouselProps {
  sponsors: Sponsor[];
  title?: string;
  autoplay?: boolean;
  autoplayInterval?: number;
}

/**
 * SponsorsCarousel component - displays sponsors in a horizontal carousel.
 * Features:
 * - Auto-play with pause on hover
 * - Manual navigation with buttons
 * - Responsive design (adapts to container width)
 * - Tier-based styling
 * - Smooth transitions
 */
export function SponsorsCarousel({
  sponsors,
  title = "Nos sponsors",
  autoplay = true,
  autoplayInterval = 5000,
}: SponsorsCarouselProps): React.ReactNode {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Group sponsors by tier for display
  const sponsorsByTier: Record<string, Sponsor[]> = {
    GOLD: [],
    SILVER: [],
    BRONZE: [],
  };

  sponsors.forEach((sponsor) => {
    if (sponsorsByTier[sponsor.tier]) {
      sponsorsByTier[sponsor.tier].push(sponsor);
    }
  });

  // Sort each tier by order
  Object.keys(sponsorsByTier).forEach((tier) => {
    sponsorsByTier[tier].sort((a, b) => a.order - b.order);
  });

  // Auto-play logic
  useEffect(() => {
    if (!autoplay || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, isHovered, sponsors.length, autoplayInterval]);

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section
      className="relative py-16 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="mt-2 text-muted-foreground">
            Merci à nos partenaires pour leur soutien
          </p>
        </div>

        {/* Carousel container */}
        <div className="relative">
          {/* Sponsors grid - shows all sponsors, carousel effect via CSS */}
          <div
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex-shrink-0 snap-center w-64 md:w-72 lg:w-80"
              >
                <SponsorCard sponsor={sponsor} />
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-full h-10 w-10"
            onClick={() => {
              const newIndex =
                currentIndex === 0 ? sponsors.length - 1 : currentIndex - 1;
              setCurrentIndex(newIndex);
              document
                .querySelector(".flex.gap-6")
                ?.scrollTo({ left: newIndex * 300, behavior: "smooth" });
            }}
            aria-label="Sponsor précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded-full h-10 w-10"
            onClick={() => {
              const newIndex = (currentIndex + 1) % sponsors.length;
              setCurrentIndex(newIndex);
              document
                .querySelector(".flex.gap-6")
                ?.scrollTo({ left: newIndex * 300, behavior: "smooth" });
            }}
            aria-label="Sponsor suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Pagination dots */}
        <div className="mt-6 flex justify-center gap-2">
          {sponsors.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-muted"
              }`}
              onClick={() => {
                setCurrentIndex(index);
                document
                  .querySelector(".flex.gap-6")
                  ?.scrollTo({ left: index * 300, behavior: "smooth" });
              }}
              aria-label={`Aller au sponsor ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
