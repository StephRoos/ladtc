"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
 *
 * @param status - The membership status
 * @returns Label and CSS class name for the badge
 */
export function getMembershipStatusConfig(status: MembershipStatus): StatusConfig {
  return STATUS_CONFIG[status];
}

/**
 * Calculates the number of days until a renewal date.
 * Negative values mean the date has passed.
 *
 * @param renewalDate - The renewal date
 * @returns Number of days (positive = future, negative = past)
 */
export function getDaysUntilRenewal(renewalDate: Date): number {
  const now = new Date();
  const diffMs = new Date(renewalDate).getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

interface MembershipCardProps {
  membership: Membership | null;
}

/**
 * Card displaying membership status, renewal info, and payment details.
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
  const daysUntil = getDaysUntilRenewal(membership.renewalDate);

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
              {new Date(membership.joinedAt).toLocaleDateString("fr-BE")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Renouvellement</p>
            <p className="font-medium">
              {new Date(membership.renewalDate).toLocaleDateString("fr-BE")}
            </p>
          </div>
          {membership.paidAt && (
            <div>
              <p className="text-muted-foreground">Dernier paiement</p>
              <p className="font-medium">
                {new Date(membership.paidAt).toLocaleDateString("fr-BE")}
              </p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Montant annuel</p>
            <p className="font-medium">{membership.amount} EUR</p>
          </div>
        </div>

        {membership.status === "ACTIVE" && daysUntil <= 30 && daysUntil > 0 && (
          <div className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
            Renouvellement dans {daysUntil} jour{daysUntil > 1 ? "s" : ""}
          </div>
        )}
        {membership.status === "EXPIRED" && (
          <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
            Cotisation expirée — contactez le bureau pour renouveler
          </div>
        )}
        {membership.status === "PENDING" && (
          <div className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
            En attente de paiement — contactez le bureau à bureau@ladtc.be
          </div>
        )}
      </CardContent>
    </Card>
  );
}
