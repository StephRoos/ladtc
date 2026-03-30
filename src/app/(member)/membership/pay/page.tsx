"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Membership } from "@/types";

async function fetchMembership(): Promise<Membership | null> {
  const res = await fetch("/api/membership");
  if (!res.ok) return null;
  const data = (await res.json()) as { membership: Membership | null };
  return data.membership;
}

/**
 * Membership payment page. Shows amount and pay button.
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

  const daysUntil = useMemo(
    () =>
      membership?.renewalDate
        ? Math.ceil((new Date(membership.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0,
    [membership?.renewalDate],
  );

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

  const isActive = membership.status === "ACTIVE";
  const canPay = !isActive || daysUntil <= 30;

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
          <CardTitle>Cotisation annuelle</CardTitle>
          <Badge
            className={`border text-xs ${
              isActive
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : membership.status === "PENDING"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}
          >
            {isActive ? "Actif" : membership.status === "PENDING" ? "En attente" : "Expiré"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Montant</p>
              <p className="text-2xl font-bold text-primary">{membership.amount.toFixed(2)} EUR</p>
            </div>
            <div>
              <p className="text-muted-foreground">Renouvellement</p>
              <p className="font-medium">
                {new Date(membership.renewalDate).toLocaleDateString("fr-BE")}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {canPay ? (
            <Button className="w-full" disabled={payLoading} onClick={handlePay}>
              {payLoading ? "Redirection vers Stripe..." : "Payer par carte ou Bancontact"}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Votre cotisation est active. Le renouvellement sera possible 30 jours avant l&apos;échéance.
            </p>
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
