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
  scrollSpeed?: number; // pixels per second
}

/**
 * SponsorsCarousel component - displays sponsors in a horizontal carousel.
 * Features:
 * - Continuous smooth auto-scrolling (no discrete jumps)
 * - Pause on hover
 * - Manual navigation with buttons
 * - Responsive design (adapts to container width)
 * - Large logos with minimal text
 * - No pagination dots (clean design)
 * - Seamless looping
 */
export function SponsorsCarousel({
  sponsors,
  title = "Nos sponsors",
  autoplay = true,
  scrollSpeed = 40,
}: SponsorsCarouselProps): React.ReactNode {
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

  // Auto-scroll logic - improved smooth scrolling with seamless looping
  useEffect(() => {
    if (!autoplay || isHovered || sponsors.length <= 1) return;

    const carousel = document.getElementById("sponsors-carousel");
    if (!carousel) return;

    let animationId: number;
    let startTime: number | null = null;
    let lastTimestamp = 0;
    let accumulatedTime = 0;
    let lastScrollPosition = 0;
    
    // Get initial card width
    const getCardWidth = () => {
      const firstCard = carousel.querySelector('.flex-shrink-0');
      return firstCard ? firstCard.getBoundingClientRect().width : 320;
    };
    
    let cardWidth = getCardWidth();
    const cardWithGap = cardWidth + 16; // 16px for gap-4
    const totalWidth = cardWithGap * sponsors.length;
    
    // Responsive speed - faster on larger screens
    const baseSpeed = scrollSpeed;
    const responsiveSpeed = () => {
      return baseSpeed * (window.innerWidth > 1200 ? 1.2 : window.innerWidth > 768 ? 1.1 : 0.9);
    };
    
    // Handle window resize
    const handleResize = () => {
      cardWidth = getCardWidth();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Smooth easing function for more natural movement
    const easeOutQuad = (t: number): number => {
      return t * (2 - t);
    };
    
    const animateScroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      // Calculate delta time for consistent speed across different frame rates
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      accumulatedTime += deltaTime;
      
      // Only update scroll position every 16ms (~60fps) for performance
      if (accumulatedTime >= 16) {
        const elapsed = timestamp - startTime;
        
        // Calculate scroll progress with easing for smoother start/stop
        const rawProgress = (elapsed * responsiveSpeed() / 1000) % totalWidth;
        const easedProgress = rawProgress * easeOutQuad(Math.min(elapsed / 2000, 1));
        
        // Seamless looping: when we reach the end, jump to beginning
        // but do it when the card is mostly out of view for smooth transition
        const scrollPosition = easedProgress % totalWidth;
        
        // Only reset if we're at a natural breaking point (between cards)
        if (scrollPosition < cardWithGap && lastScrollPosition >= totalWidth - cardWithGap) {
          carousel.scrollTo({ left: 0, behavior: 'auto' });
        } else {
          carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }
        
        lastScrollPosition = scrollPosition;
        accumulatedTime = 0;
      }
      
      animationId = requestAnimationFrame(animateScroll);
    };
    
    animationId = requestAnimationFrame(animateScroll);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [autoplay, isHovered, sponsors.length, scrollSpeed]);

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
            id="sponsors-carousel"
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth "
            
          >
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex-shrink-0 snap-center w-72 md:w-80 lg:w-96"
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
              const carousel = document.getElementById("sponsors-carousel");
              if (carousel) {
                const firstCard = carousel.querySelector('.flex-shrink-0');
                const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
                const cardWithGap = cardWidth + 16;
                const currentScroll = carousel.scrollLeft;
                const newScroll = Math.max(0, currentScroll - cardWithGap);
                carousel.scrollTo({ left: newScroll, behavior: "smooth" });
              }
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
              const carousel = document.getElementById("sponsors-carousel");
              if (carousel) {
                const firstCard = carousel.querySelector('.flex-shrink-0');
                const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
                const cardWithGap = cardWidth + 16;
                const currentScroll = carousel.scrollLeft;
                const maxScroll = carousel.scrollWidth - carousel.clientWidth;
                const newScroll = Math.min(maxScroll, currentScroll + cardWithGap);
                carousel.scrollTo({ left: newScroll, behavior: "smooth" });
              }
            }}
            aria-label="Sponsor suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
