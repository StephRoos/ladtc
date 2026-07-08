"use client";

import { useRef, useState, useEffect, useId } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponsorCard } from "./SponsorCard";
import type { Sponsor } from "@/types/sponsor";

interface SponsorsCarouselProps {
  sponsors: Sponsor[];
  title?: string;
  autoplay?: boolean;
  scrollSpeed?: number; // pixels per second
}

/**
 * SponsorsCarousel component - displays sponsors in a horizontal infinite carousel.
 *
 * Features:
 * - Infinite seamless loop by tripling the items and resetting scroll position
 *   transparently when reaching a duplicate set.
 * - Constant speed based on time delta (frame-rate independent).
 * - Pause on hover.
 * - Manual navigation with buttons.
 * - Responsive card widths.
 */
export function SponsorsCarousel({
  sponsors,
  title = "Nos sponsors",
  autoplay = true,
  scrollSpeed = 40,
}: SponsorsCarouselProps): React.ReactNode {
  const uniqueId = useId();
  const carouselId = `sponsors-carousel-${uniqueId}`;
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!autoplay || sponsors.length <= 1) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    let animationId: number;
    let lastTimestamp = 0;
    let isActive = true;

    const animate = (timestamp: number) => {
      if (!isActive) return;

      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }

      const deltaMs = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!isHovered) {
        const oneSetWidth = carousel.scrollWidth / 3;
        const shift = (scrollSpeed * deltaMs) / 1000;

        carousel.scrollLeft += shift;

        // When we finish scrolling through the first duplicate set, jump back
        // to the equivalent position in the second set. The content is identical
        // so the jump is invisible to the user.
        if (carousel.scrollLeft >= oneSetWidth) {
          carousel.scrollLeft -= oneSetWidth;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      isActive = false;
      cancelAnimationFrame(animationId);
    };
  }, [autoplay, sponsors.length, scrollSpeed, isHovered]);

  // Triple the sponsors to create the illusion of an infinite loop.
  const loopSponsors = sponsors.length > 0 ? [...sponsors, ...sponsors, ...sponsors] : [];

  if (sponsors.length === 0) {
    return null;
  }

  const scrollByCard = (direction: 1 | -1) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.querySelector(".flex-shrink-0") as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
    const cardWithGap = cardWidth + 16; // 16px for gap-4
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;

    const newScroll = Math.min(
      Math.max(0, carousel.scrollLeft + direction * cardWithGap),
      maxScroll
    );

    carousel.scrollTo({ left: newScroll, behavior: "smooth" });
  };

  return (
    <section className="relative py-16 overflow-hidden">
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
          <div
            id={carouselId}
            ref={carouselRef}
            className="flex gap-4 overflow-x-hidden pb-4 will-change-transform"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ scrollBehavior: "auto" }}
          >
            {loopSponsors.map((sponsor, index) => (
              <div
                key={`${sponsor.id}-${index}`}
                className="flex-shrink-0 w-56 sm:w-64 md:w-72 lg:w-80 xl:w-96"
              >
                <SponsorCard sponsor={sponsor} />
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scrollByCard(-1)}
            aria-label="Sponsor précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scrollByCard(1)}
            aria-label="Sponsor suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
