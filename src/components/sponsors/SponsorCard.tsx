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
    border: "border-yellow-500",
    hoverBorder: "hover:border-yellow-400",
    glow: "ring-yellow-500/50",
  },
  SILVER: {
    border: "border-gray-400",
    hoverBorder: "hover:border-gray-300",
    glow: "ring-gray-400/50",
  },
  BRONZE: {
    border: "border-amber-600",
    hoverBorder: "hover:border-amber-500",
    glow: "ring-amber-600/50",
  },
} as const;

/**
 * SponsorCard component - displays a sponsor with logo, name, and website link.
 * Features:
 * - Border color based on tier (gold, silver, bronze)
 * - Hover effect with scale-105
 * - Optional glow effect
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
      {/* Logo */}
      <div className="relative mb-4 h-20 w-32 overflow-hidden">
        {sponsor.logoUrl ? (
          <Image
            src={sponsor.logoUrl}
            alt={`${sponsor.name} logo`}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, 128px"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/20 text-muted-foreground">
            <span className="text-sm font-medium">Pas de logo</span>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
        {sponsor.name}
      </h3>

      {/* Tier badge */}
      <span
        className={`mt-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
          sponsor.tier === "GOLD"
            ? "bg-yellow-500/10 text-yellow-500"
            : sponsor.tier === "SILVER"
              ? "bg-gray-400/10 text-gray-400"
              : "bg-amber-600/10 text-amber-500"
        }`}
      >
        {sponsor.tier}
      </span>

      {/* Glow effect on hover */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-lg ${config.glow} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />
    </Link>
  );
}
