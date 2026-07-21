"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentSeason, isSeasonCurrent, formatSeason } from "@/lib/membership";
import type { Membership, MembershipStatus } from "@/types";

interface StatusConfig {
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<MembershipStatus, StatusConfig> = {
  ACTIVE: { label: "Actif", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  PENDING: { label: "En attente", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  INACTIVE: { label: "Inactif", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  EXPIRED: { label: "Expiré", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

/**
 * Returns the status badge config for a given MembershipStatus.
 */
export function getMembershipStatusConfig(status: MembershipStatus): StatusConfig {
  return STATUS_CONFIG[status];
}

interface MembershipCardProps {
  membership: Membership | null;
}

/**
 * Card displaying membership status and season payment info.
 */
export function MembershipCard({ membership }: MembershipCardProps): React.ReactNode {
  if (!membership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cotisation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucune cotisation enregistrée. Contactez le bureau pour régulariser votre situation.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = getMembershipStatusConfig(membership.status);
  // A membership counts as "paid for the current season" only when its season
  // matches AND its status is ACTIVE. A PENDING membership for the current
  // season is awaiting payment, not paid (same policy as the orders API,
  // which only accepts active members for cotisation-current-season).
  const paidForCurrentSeason =
    isSeasonCurrent(membership.season) && membership.status === "ACTIVE";
  const currentSeason = getCurrentSeason();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Cotisation</CardTitle>
        <Badge className={cn("border", statusConfig.className)}>
          {statusConfig.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Membre depuis</p>
            <p className="font-medium">
              {new Date(membership.joinedAt).getFullYear()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Saison en cours</p>
            <p className="font-medium">{currentSeason}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Saison</p>
            <p className="font-medium">
              {membership.season ? formatSeason(membership.season) : "Aucune"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Montant annuel</p>
            <p className="font-medium">{membership.amount} EUR</p>
          </div>
        </div>

        {paidForCurrentSeason && (
          <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-400">
            Cotisation à jour pour la {currentSeason}
          </div>
        )}
        {!paidForCurrentSeason && membership.status !== "INACTIVE" && (
          <div className="space-y-2">
            <div className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
              Cotisation non payée pour la saison {currentSeason}
            </div>
            <Button asChild size="sm" className="w-full">
              <Link href="/membership/pay">Payer en ligne</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ou contactez le bureau à bureau@ladtc.be
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
