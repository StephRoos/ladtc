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

  // Auto-scroll logic - ultra-smooth scrolling with mouse interaction handling
  useEffect(() => {
    if (!autoplay || sponsors.length <= 1) return;

    const carousel = document.getElementById("sponsors-carousel");
    if (!carousel) return;

    let animationId: number;
    let startTime: number | null = null;
    let lastTimestamp = 0;
    let accumulatedTime = 0;
    let lastScrollPosition = 0;
    let isUserInteracting = false;
    
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
    
    // Handle mouse interactions
    const handleMouseEnter = () => {
      isUserInteracting = true;
    };
    
    const handleMouseLeave = () => {
      isUserInteracting = false;
    };
    
    // Add smooth scroll behavior to prevent jumps
    const applySmoothScroll = () => {
      carousel.style.scrollBehavior = 'smooth';
    };
    
    window.addEventListener('resize', handleResize);
    carousel.addEventListener('mouseenter', handleMouseEnter);
    carousel.addEventListener('mouseleave', handleMouseLeave);
    
    // Enhanced easing function for ultra-smooth movement
    const smoothEase = (t: number): number => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };
    
    const animateScroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      // Skip animation if user is interacting
      if (isUserInteracting) {
        animationId = requestAnimationFrame(animateScroll);
        return;
      }
      
      // Calculate delta time for consistent speed across different frame rates
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      accumulatedTime += deltaTime;
      
      // Use smaller time slices for ultra-smooth animation (8ms ~120fps)
      if (accumulatedTime >= 8) {
        const elapsed = timestamp - startTime;
        
        // Calculate scroll progress with enhanced easing
        const rawProgress = (elapsed * responsiveSpeed() / 1000) % totalWidth;
        const easedProgress = rawProgress * smoothEase(Math.min(elapsed / 3000, 1));
        
        // Ultra-smooth seamless looping
        const scrollPosition = easedProgress % totalWidth;
        
        // Only reset if we're at a natural breaking point (between cards)
        // Use CSS transform for smoother reset when needed
        if (scrollPosition < cardWithGap && lastScrollPosition >= totalWidth - cardWithGap) {
          // Use requestAnimationFrame for the reset to prevent visual glitches
          requestAnimationFrame(() => {
            carousel.scrollTo({ left: 0, behavior: 'auto' });
          });
        } else {
          // Apply smooth scroll behavior
          applySmoothScroll();
          carousel.scrollLeft = scrollPosition;
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
      carousel.removeEventListener('mouseenter', handleMouseEnter);
      carousel.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [autoplay, sponsors.length, scrollSpeed]);

  if (sponsors.length === 0) {
    return null;
  }

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
          {/* Sponsors grid - optimized for smooth scrolling */}
          <div
            id="sponsors-carousel"
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth will-change-transform"
            // Disable browser's native scroll snap for smoother custom scrolling
            style={{ scrollSnapType: 'none' }}
          >
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex-shrink-0 w-72 md:w-80 lg:w-96"
                // Remove snap-center to prevent jumping
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
