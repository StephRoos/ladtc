"use client";

import Link from "next/link";
import { useMembershipStatus } from "@/hooks/use-membership-status";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Restricts its children to members in good standing (active membership for the
 * current season). Anonymous visitors and members whose dues lapsed see an
 * access message with the relevant call to action instead of the content.
 */
export function MembershipGate({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { eligibility, isLoading } = useMembershipStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (eligibility.canOrder) {
    return <>{children}</>;
  }

  const isAnonymous = eligibility.reason === "not_authenticated";

  return (
    <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
      <h2 className="text-xl font-semibold text-foreground">
        Réservé aux membres en ordre de cotisation
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {isAnonymous
          ? "L'équipement du club est accessible aux membres dont la cotisation est à jour. Connectez-vous pour y accéder."
          : "L'accès à l'équipement du club est réservé aux membres dont la cotisation est à jour pour la saison en cours."}
      </p>
      <div className="mt-6">
        {isAnonymous ? (
          <Button asChild>
            <Link href="/auth/login?callbackUrl=/equipment">Se connecter</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/membership/pay">Payer ma cotisation</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
