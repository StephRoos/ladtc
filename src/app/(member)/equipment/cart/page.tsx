"use client";

import Link from "next/link";
import Image from "next/image";
import { useRequireAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shopping cart page — shows cart items, quantities, totals, and checkout button.
 * Requires authentication.
 */
export default function CartPage(): React.ReactNode {
  const { isLoading } = useRequireAuth();
  const { items, removeItem, updateQuantity, total } = useCart();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-foreground">Mon panier</h1>

      {items.length === 0 ? (
        <div className="rounded-md border border-border p-10 text-center">
          <p className="text-muted-foreground">Votre panier est vide.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/equipment">Découvrir l&apos;équipement</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 rounded-md border border-border p-4"
              >
                {/* Product image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  {item.size && (
                    <p className="text-sm text-muted-foreground">Taille : {item.size}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {item.price.toFixed(2)} € / pièce
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded border border-border hover:border-primary disabled:opacity-40"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1, item.size)
                    }
                    disabled={item.quantity <= 1}
                    aria-label="Diminuer la quantité"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded border border-border hover:border-primary"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1, item.size)
                    }
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="flex flex-col items-end justify-between">
                  <p className="font-semibold text-foreground">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                  <button
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.productId, item.size)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}

            <div className="text-sm">
              <Link
                href="/equipment"
                className="text-muted-foreground hover:text-primary"
              >
                ← Continuer les achats
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-md border border-border p-6 space-y-4 h-fit">
            <h2 className="font-semibold text-foreground text-lg">Résumé</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frais de livraison</span>
              <span>À déterminer</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            <Button className="w-full" asChild>
              <Link href="/equipment/checkout">Passer la commande</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
