"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { CheckoutForm } from "@/components/forms/CheckoutForm";
import { Skeleton } from "@/components/ui/skeleton";
import type { CheckoutFormData } from "@/lib/schemas";

/**
 * Checkout page — shipping form, cart summary, and place order button.
 * Requires authentication.
 */
export default function CheckoutPage(): React.ReactNode {
  const router = useRouter();
  const { isLoading, user } = useRequireAuth();
  const { items, total, clear } = useCart();
  const createOrder = useCreateOrder();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-muted-foreground">Votre panier est vide.</p>
        <Link href="/equipment" className="mt-4 inline-block text-primary hover:underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  async function handleSubmit(data: CheckoutFormData): Promise<void> {
    const orderItems = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      size: i.size,
    }));

    const result = await createOrder.mutateAsync({ ...data, items: orderItems });
    clear();
    router.push(`/equipment/order/${result.orderId}`);
  }

  const defaultValues = user
    ? {
        shippingName: (user.name as string | undefined) ?? "",
        shippingEmail: user.email,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-foreground">Finaliser la commande</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout form */}
        <div className="lg:col-span-2">
          <CheckoutForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isSubmitting={createOrder.isPending}
            error={createOrder.error?.message}
          />
        </div>

        {/* Cart summary */}
        <div className="rounded-md border border-border p-6 space-y-4 h-fit">
          <h2 className="font-semibold text-foreground text-lg">Récapitulatif</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground truncate pr-2">
                  {item.name}
                  {item.size ? ` (${item.size})` : ""} × {item.quantity}
                </span>
                <span className="shrink-0 font-medium">
                  {(item.price * item.quantity).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Le paiement est traité manuellement par le comité.
          </p>
        </div>
      </div>
    </div>
  );
}
