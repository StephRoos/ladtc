"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import type { Sponsor } from "@/types/sponsor";

/**
 * Tier configuration for display
 */
const tierConfig = {
  GOLD: {
    label: "Or",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    border: "border-yellow-500",
  },
  SILVER: {
    label: "Argent",
    color: "text-gray-400",
    bgColor: "bg-gray-400/10",
    border: "border-gray-400",
  },
  BRONZE: {
    label: "Bronze",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    border: "border-amber-500",
  },
  SUPPORTER: {
    label: "Supporter",
    color: "text-stone-500",
    bgColor: "bg-stone-500/10",
    border: "border-stone-500",
  },
  AMI: {
    label: "Ami du club",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    border: "border-emerald-500",
  },
} as const;

interface SponsorTableProps {
  sponsors: Sponsor[];
  onEdit: (sponsor: Sponsor) => void;
  onDelete: (sponsor: Sponsor) => void;
  onToggleActive: (sponsor: Sponsor) => void;
  isLoading?: boolean;
}

/**
 * SponsorTable component - displays a table of sponsors with actions.
 * Features:
 * - Tier badges with colors
 * - Active/inactive status indicators
 * - Actions: edit, delete, toggle active
 * - Responsive design
 */
export function SponsorTable({
  sponsors,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading = false,
}: SponsorTableProps): React.ReactNode {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border last:border-0 p-4"
          >
            <Skeleton className="h-10 w-12 rounded" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
            <div className="ml-auto">
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sponsors.length === 0) {
    return (
      <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
        <p>Aucun sponsor trouvé</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="hidden grid-cols-[40px_2fr_1fr_1fr_1fr_80px] items-center gap-4 p-4 text-sm font-semibold text-muted-foreground md:grid">
        <div />
        <div>Nom</div>
        <div>Niveau</div>
        <div>Ordre</div>
        <div>Statut</div>
        <div className="text-right">Actions</div>
      </div>

      {sponsors.map((sponsor) => {
        const config = tierConfig[sponsor.tier] || tierConfig.BRONZE;

        return (
          <div
            key={sponsor.id}
            className="flex items-center gap-4 border-b border-border last:border-0 p-4"
          >
            {/* Logo preview */}
            <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded border border-border">
              {sponsor.logoUrl ? (
                <Image
                  src={sponsor.logoUrl}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/20 text-xs text-muted-foreground">
                  Pas
                </div>
              )}
            </div>

            {/* Name */}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{sponsor.name}</p>
              {sponsor.websiteUrl && (
                <p className="text-xs text-muted-foreground truncate">
                  {sponsor.websiteUrl}
                </p>
              )}
            </div>

            {/* Tier badge */}
            <div className="hidden md:block">
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bgColor} ${config.color} border ${config.border}`}
              >
                {config.label}
              </span>
            </div>

            {/* Order */}
            <div className="hidden md:block text-sm text-muted-foreground">
              {sponsor.order}
            </div>

            {/* Active status */}
            <div className="hidden md:block">
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  sponsor.isActive
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {sponsor.isActive ? "Actif" : "Inactif"}
              </span>
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(sponsor)}
                className="h-8 w-8 p-0"
                aria-label={`Modifier ${sponsor.name}`}
              >
                <Edit className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={deletingId === sponsor.id}
                    aria-label={`Plus d'actions pour ${sponsor.name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onToggleActive(sponsor)}>
                    <span className={sponsor.isActive ? "text-red-500" : "text-green-500"}>
                      {sponsor.isActive ? (
                        <EyeOff className="mr-2 h-4 w-4" />
                      ) : (
                        <Eye className="mr-2 h-4 w-4" />
                      )}
                    </span>
                    {sponsor.isActive ? "Désactiver" : "Activer"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(sponsor)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
