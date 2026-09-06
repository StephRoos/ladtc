/**
 * Type definitions for Sponsors feature
 */

export type SponsorTier = "GOLD" | "SILVER" | "BRONZE" | "SUPPORTER" | "AMI";

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string | null;
  tier: SponsorTier;
  websiteUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SponsorCardProps {
  sponsor: Sponsor;
}

export interface SponsorFormData {
  name: string;
  tier: SponsorTier;
  websiteUrl?: string;
  order?: number;
  isActive?: boolean;
  logoUrl?: string | null;
}

/** Sponsor with logo file for creation/update */
export interface SponsorCreateInput extends SponsorFormData {
  logoFile?: File;
}

/** Response type for sponsors list */
export interface SponsorsResponse {
  sponsors: Sponsor[];
  total: number;
}

/** Response type for single sponsor */
export interface SponsorResponse {
  sponsor: Sponsor;
}

/** Grouped sponsors by tier for display */
export interface SponsorsByTier {
  gold: Sponsor[];
  silver: Sponsor[];
  bronze: Sponsor[];
  supporter: Sponsor[];
  ami: Sponsor[];
}
