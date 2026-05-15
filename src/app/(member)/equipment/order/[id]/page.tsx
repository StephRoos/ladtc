"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-auth";
import { useOrder } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderStatusConfig } from "@/components/admin/orders/OrderTable";

function OrderConfirmationContent(): React.ReactNode {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { isLoading: authLoading } = useRequireAuth();
  const { data, isLoading, isError } = useOrder(id);
  const [payLoading, setPayLoading] = useState(false);
  const paymentCancelled = searchParams.get("payment") === "cancelled";

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data?.order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-muted-foreground">Commande introuvable.</p>
        <Link href="/orders" className="mt-4 inline-block text-primary hover:underline">
          Mes commandes
        </Link>
      </div>
    );
  }

  const { order } = data;
  const statusConfig = getOrderStatusConfig(order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
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
        <h1 className="text-3xl font-bold text-foreground">
          {order.paidAt ? "Commande confirmée !" : "Merci pour votre commande !"}
        </h1>
        {order.paidAt ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-1.5 text-sm font-medium text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            Paiement reçu le {new Date(order.paidAt).toLocaleDateString("fr-BE")}
          </div>
        ) : (
          <p className="mt-2 text-muted-foreground">
            Votre commande a bien été enregistrée.
          </p>
        )}
      </div>

      {paymentCancelled && !order.paidAt && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          Le paiement a été annulé. Vous pouvez réessayer ci-dessous.
        </div>
      )}

      <div className="rounded-md border border-border p-6 space-y-6">
        {/* Order ID & status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Numéro de commande</p>
            <p className="font-mono text-sm font-medium">{order.id}</p>
          </div>
          <Badge className={`border text-xs ${statusConfig.className}`}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Items */}
        <div>
          <h2 className="mb-3 font-semibold text-foreground">Articles commandés</h2>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product.name}
                  {item.size ? ` (${item.size})` : ""} × {item.quantity}
                </span>
                <span className="font-medium">
                  {(item.price * item.quantity).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{order.total.toFixed(2)} €</span>
          </div>
        </div>

        {/* Delivery method + address */}
        <div>
          <h2 className="mb-2 font-semibold text-foreground">Mode de livraison</h2>
          {order.deliveryMethod === "CLUB_PICKUP" ? (
            <p className="text-sm text-muted-foreground">
              Retrait au club. Récupérer lors d&apos;une séance.
            </p>
          ) : (
            <address className="not-italic text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Livraison à domicile</p>
              <p>{order.shippingName}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingZip} {order.shippingCity}
              </p>
              <p>{order.shippingCountry}</p>
              <p>{order.shippingPhone}</p>
              <p>{order.shippingEmail}</p>
            </address>
          )}
        </div>
      </div>

      {/* Payment trigger — any non-cancelled, non-delivered, unpaid order can be paid.
          Direct-stock orders (RECEIVED at creation) are paid immediately at checkout,
          so by the time the member visits this page they will see "déjà payée" instead. */}
      {!order.paidAt &&
        order.status !== "CANCELLED" &&
        order.status !== "DELIVERED" && (
          <div className="mt-6 space-y-2">
            {order.status === "PENDING" && (
              <p className="text-sm text-muted-foreground">
                Cette commande sera regroupée avec d&apos;autres lors du prochain lot.
                Vous pourrez la payer maintenant ou attendre la réception du lot.
              </p>
            )}
            {order.status === "RECEIVED" && (
              <p className="text-sm text-foreground">
                Le lot est arrivé au club. Merci de régler votre commande.
              </p>
            )}
            <Button
              className="w-full sm:w-auto"
              disabled={payLoading}
              onClick={async () => {
                setPayLoading(true);
                try {
                  const res = await fetch("/api/stripe/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: order.id }),
                  });
                  if (res.ok) {
                    const { url } = (await res.json()) as { url: string };
                    if (url) {
                      window.location.href = url;
                      return;
                    }
                  }
                } catch {
                  // Stripe unavailable
                }
                setPayLoading(false);
              }}
            >
              {payLoading ? "Redirection..." : "Payer maintenant"}
            </Button>
          </div>
        )}

      {order.paidAt && order.status !== "DELIVERED" && (
        <div className="mt-6 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
          Commande déjà payée.
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
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
 * Order confirmation page after successful checkout.
 * Wrapped in Suspense for useSearchParams().
 */
export default function OrderConfirmationPage(): React.ReactNode {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-10">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
