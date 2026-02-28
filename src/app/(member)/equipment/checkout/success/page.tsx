"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function CheckoutSuccessContent(): React.ReactNode {
  useRequireAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    async function fetchStatus(): Promise<void> {
      try {
        const res = await fetch(`/api/stripe/checkout/status?session_id=${sessionId}`);
        if (res.ok) {
          const data = (await res.json()) as { orderId: string | null };
          setOrderId(data.orderId);
        }
      } catch {
        // Silently fail — show generic success
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

      <h1 className="mb-3 text-3xl font-bold text-foreground">Paiement réussi !</h1>
      <p className="mb-8 text-muted-foreground">
        Votre paiement a été accepté. Votre commande est confirmée et sera préparée prochainement.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {orderId && (
          <Button asChild>
            <Link href={`/equipment/order/${orderId}`}>Voir ma commande</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/orders">Mes commandes</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Stripe checkout success page for equipment orders.
 * Wrapped in Suspense for useSearchParams().
 */
export default function CheckoutSuccessPage(): React.ReactNode {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-10">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
