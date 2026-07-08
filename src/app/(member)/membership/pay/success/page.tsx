"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function MembershipPaySuccessContent(): React.ReactNode {
  useRequireAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verified, setVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setVerified(false);
      setLoading(false);
      return;
    }

    async function fetchStatus(): Promise<void> {
      try {
        const res = await fetch(`/api/stripe/checkout/status?session_id=${sessionId}`);
        if (res.ok) {
          const data = (await res.json()) as {
            type: string | null;
            membershipId: string | null;
            paid: boolean;
          };
          setVerified(data.type === "membership_dues" && data.paid);
        } else {
          setVerified(false);
        }
      } catch {
        setVerified(false);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="mb-3 text-3xl font-bold text-foreground">
          Paiement non confirmé
        </h1>
        <p className="mb-8 text-muted-foreground">
          Nous n&apos;avons pas pu confirmer votre paiement. Si vous venez de
          terminer la transaction, patientez quelques instants et rafraîchissez
          la page.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/membership/pay">Réessayer le paiement</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/profile">Mon profil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-green-400"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h1 className="mb-3 text-3xl font-bold text-foreground">Cotisation payée !</h1>
      <p className="mb-8 text-muted-foreground">
        Votre cotisation annuelle a été confirmée. Merci pour votre soutien au club !
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/profile">Mon profil</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Membership payment success page.
 * Verifies the Stripe session before showing the success message.
 */
export default function MembershipPaySuccessPage(): React.ReactNode {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-10">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      }
    >
      <MembershipPaySuccessContent />
    </Suspense>
  );
}
