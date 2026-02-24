"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-auth";
import { useOrder } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderStatusConfig } from "@/components/admin/OrderTable";
import type { OrderStatus } from "@/types";

/**
 * Member order detail page.
 * Requires authentication.
 */
export default function MemberOrderDetailPage(): React.ReactNode {
  const { id } = useParams<{ id: string }>();
  const { isLoading: authLoading } = useRequireAuth();
  const { data, isLoading, isError } = useOrder(id);

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
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
  const statusConfig = getOrderStatusConfig(order.status as OrderStatus);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Mes commandes
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Commande</h1>
        <Badge className={`border text-xs ${statusConfig.className}`}>
          {statusConfig.label}
        </Badge>
      </div>

      <div className="space-y-6 rounded-md border border-border p-6">
        {/* Order info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Numéro</p>
            <p className="font-mono font-medium">{order.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">
              {new Date(order.createdAt).toLocaleDateString("fr-BE")}
            </p>
          </div>
          {order.trackingNumber && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Numéro de suivi</p>
              <p className="font-mono font-medium">{order.trackingNumber}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div>
          <h2 className="mb-3 font-semibold text-foreground">Articles</h2>
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
          <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span>
              <span>{order.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison</span>
              <span>{order.shippingCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>{order.total.toFixed(2)} €</span>
            </div>
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

        {order.notes && (
          <div>
            <h2 className="mb-2 font-semibold text-foreground">Notes</h2>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/contact">Contacter le support</Link>
        </Button>
      </div>
    </div>
  );
}
