"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-auth";
import { useOrder } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderStatusConfig } from "@/components/admin/OrderTable";

/**
 * Order confirmation page after successful checkout.
 * Requires authentication.
 */
export default function OrderConfirmationPage(): React.ReactNode {
  const { id } = useParams<{ id: string }>();
  const { isLoading: authLoading } = useRequireAuth();
  const { data, isLoading, isError } = useOrder(id);

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
        <h1 className="text-3xl font-bold text-foreground">Merci pour votre commande !</h1>
        <p className="mt-2 text-muted-foreground">
          Votre commande a bien été enregistrée. Le comité vous contactera pour le paiement.
        </p>
      </div>

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

        {/* Shipping address */}
        <div>
          <h2 className="mb-2 font-semibold text-foreground">Adresse de livraison</h2>
          <address className="not-italic text-sm text-muted-foreground space-y-1">
            <p>{order.shippingName}</p>
            <p>{order.shippingAddress}</p>
            <p>
              {order.shippingZip} {order.shippingCity}
            </p>
            <p>{order.shippingCountry}</p>
            <p>{order.shippingPhone}</p>
            <p>{order.shippingEmail}</p>
          </address>
        </div>
      </div>

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
