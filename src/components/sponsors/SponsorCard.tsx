"use client";

import Image from "next/image";
import Link from "next/link";
import type { SponsorCardProps } from "@/types/sponsor";

/**
 * Tier configuration for styling
 * Colors: gold = yellow/orange, silver = gray, bronze = amber
 */
const tierConfig = {
  GOLD: {
    border: "border-border",
    hoverBorder: "hover:border-border",
    glow: "ring-primary/50",
  },
  SILVER: {
    border: "border-border",
    hoverBorder: "hover:border-border",
    glow: "ring-primary/50",
  },
  BRONZE: {
    border: "border-border",
    hoverBorder: "hover:border-border",
    glow: "ring-primary/50",
  },
} as const;

/**
 * SponsorCard component - displays a sponsor with logo, name, and website link.
 * Features:
 * - Large prominent logo (h-32)
 * - Small minimal text
 * - Border color based on tier
 * - Hover effect with scale-105
 * - Responsive design
 */
export function SponsorCard({ sponsor }: SponsorCardProps): React.ReactNode {
  const config = tierConfig[sponsor.tier] || tierConfig.BRONZE;

  return (
    <Link
      href={sponsor.websiteUrl || "#"}
      target={sponsor.websiteUrl ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className={`group relative flex flex-col items-center justify-center rounded-lg border-2 ${config.border} ${config.hoverBorder} bg-card p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg`}
      aria-label={`Visiter le site de ${sponsor.name}`}
    >
      {/* Logo - much larger and more prominent */}
      <div className="relative mb-1 h-32 w-full overflow-hidden">
        {sponsor.logoUrl ? (
          <Image
            src={sponsor.logoUrl}
            alt={`${sponsor.name} logo`}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 200px"
            priority={true}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/10">
            <span className="text-xs text-muted-foreground">Logo</span>
          </div>
        )}
      </div>

      {/* Name - smaller and more minimal */}
      <h3 className="text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-primary truncate max-w-full">
        {sponsor.name}
      </h3>

      {/* Glow effect on hover */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-lg ${config.glow} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />
    </Link>
  );
}
