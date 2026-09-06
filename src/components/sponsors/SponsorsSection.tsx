"use client";

import type { Sponsor } from "@/types/sponsor";
import { SponsorCard } from "./SponsorCard";

/**
 * Tier display configuration
 * Order: GOLD first, then SILVER, BRONZE, SUPPORTER (100 EUR) and AMI (50 EUR)
 */
const TIER_ORDER = [
  "GOLD",
  "SILVER",
  "BRONZE",
  "SUPPORTER",
  "AMI",
] as const;

/**
 * Tier labels in French for display
 */
const TIER_LABELS: Record<string, string> = {
  GOLD: "Or",
  SILVER: "Argent",
  BRONZE: "Bronze",
  SUPPORTER: "Supporter",
  AMI: "Ami du club",
};

/**
 * Tier border colors for section headers
 */
const TIER_BORDER_COLORS: Record<string, string> = {
  GOLD: "border-yellow-500",
  SILVER: "border-gray-400",
  BRONZE: "border-amber-600",
  SUPPORTER: "border-stone-500",
  AMI: "border-emerald-500",
};

interface SponsorsSectionProps {
  sponsors: Sponsor[];
  title?: string;
  showTitle?: boolean;
  maxPerTier?: number;
}

/**
 * SponsorsSection component - displays sponsors grouped by tier.
 * Features:
 * - Groups sponsors by tier (GOLD, SILVER, BRONZE)
 * - Responsive grid (2-5 columns based on screen size)
 * - Section headers for each tier
 * - Optional limit per tier
 */
export function SponsorsSection({
  sponsors,
  title = "Nos sponsors",
  showTitle = true,
  maxPerTier,
}: SponsorsSectionProps): React.ReactNode {
  // Group sponsors by tier
  const sponsorsByTier: Record<string, Sponsor[]> = {
    GOLD: [],
    SILVER: [],
    BRONZE: [],
    SUPPORTER: [],
    AMI: [],
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

  // Apply maxPerTier limit if specified
  if (maxPerTier) {
    Object.keys(sponsorsByTier).forEach((tier) => {
      sponsorsByTier[tier] = sponsorsByTier[tier].slice(0, maxPerTier);
    });
  }

  // Check if we have any sponsors to display
  const hasSponsors = Object.values(sponsorsByTier).some(
    (tierSponsors) => tierSponsors.length > 0
  );

  if (!hasSponsors) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section title */}
        {showTitle && (
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">{title}</h2>
              <p className="mt-2 text-muted-foreground">
                Merci à nos partenaires pour leur soutien
              </p>
            </div>
          </div>
        )}

        {/* Sponsors by tier */}
        <div className="space-y-12">
          {TIER_ORDER.map((tier) => {
            const tierSponsors = sponsorsByTier[tier];

            if (tierSponsors.length === 0) {
              return null;
            }

            return (
              <div key={tier}>
                {/* Tier header */}
                <div
                  className={`mb-6 border-l-4 ${TIER_BORDER_COLORS[tier]} pl-4`}
                >
                  <h3 className="text-xl font-bold">{TIER_LABELS[tier]}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tierSponsors.length} partenaire{tierSponsors.length > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Sponsors grid */}
                <div
                  className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                >
                  {tierSponsors.map((sponsor) => (
                    <SponsorCard key={sponsor.id} sponsor={sponsor} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
