"use client";

import { useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSeason, isSeasonCurrent } from "@/lib/membership";
import { onlineAmount, onlineFee } from "@/lib/membership-fees";
import type { Membership } from "@/types";

async function fetchMembership(): Promise<Membership | null> {
  const res = await fetch("/api/membership");
  if (!res.ok) return null;
  const data = (await res.json()) as { membership: Membership | null };
  return data.membership;
}

/**
 * Membership payment page. Shows season info and pay button.
 */
export default function MembershipPayPage(): React.ReactNode {
  const { isLoading: authLoading } = useRequireAuth();
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: membership, isLoading } = useQuery({
    queryKey: ["membership"],
    queryFn: fetchMembership,
    staleTime: 2 * 60 * 1000,
  });

  const currentSeason = getCurrentSeason();
  const paidForCurrentSeason = membership ? isSeasonCurrent(membership.season) : false;

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-muted-foreground">Aucune cotisation trouvée.</p>
        <Link href="/profile" className="mt-4 inline-block text-primary hover:underline">
          Retour au profil
        </Link>
      </div>
    );
  }

  async function handlePay(): Promise<void> {
    setPayLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Erreur lors de la création du paiement");
        setPayLoading(false);
        return;
      }

      const { url } = (await res.json()) as { url: string };
      if (url) {
        window.location.href = url;
        return;
      }

      setError("Impossible de créer la session de paiement");
    } catch {
      setError("Erreur de connexion");
    }

    setPayLoading(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-foreground">Payer ma cotisation</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Cotisation {currentSeason}</CardTitle>
          <Badge
            className={`border text-xs ${
              paidForCurrentSeason
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}
          >
            {paidForCurrentSeason ? "Payée" : "Non payée"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Saison</span>
              <span className="font-medium">{currentSeason}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cotisation</span>
              <span className="font-medium">{membership.amount.toFixed(2)} €</span>
            </div>
            {!paidForCurrentSeason && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Frais de traitement en ligne</span>
                  <span className="font-medium">{onlineFee(membership.amount).toFixed(2)} €</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total à payer en ligne</span>
                  <span className="text-2xl font-bold text-primary">
                    {onlineAmount(membership.amount).toFixed(2)} €
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Les frais de traitement permettent au club de percevoir
                  l&apos;intégralité de la cotisation. Le paiement en liquide auprès
                  du trésorier reste possible au tarif de{" "}
                  {membership.amount.toFixed(2)} €.
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {!paidForCurrentSeason ? (
            <Button className="w-full" disabled={payLoading} onClick={handlePay}>
              {payLoading ? "Redirection vers Stripe..." : "Payer par carte ou Bancontact"}
            </Button>
          ) : (
            <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-400">
              Cotisation à jour pour la saison {currentSeason}
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Paiement sécurisé par Stripe
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">
          Retour au profil
        </Link>
      </div>
    </div>
  );
}
