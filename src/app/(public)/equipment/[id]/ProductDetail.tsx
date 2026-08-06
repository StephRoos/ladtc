"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useMembershipStatus } from "@/hooks/use-membership-status";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductDetailProps {
  id: string;
}

const MAX_QUANTITY_PER_ITEM = 10;

/**
 * Client component for product detail with size selector, quantity, and add-to-cart.
 *
 * Stock workflow (Issue #16 sprint 2):
 * - Each size has its own stock count (ProductStock table).
 * - Sizes with stock > 0 can be purchased directly (order → RECEIVED).
 * - Sizes with stock = 0 can still be ordered (order → PENDING, joins next batch).
 * - The UI surfaces stock per size but never blocks ordering — the decision is made
 *   server-side at /api/orders.
 */
export function ProductDetail({ id }: ProductDetailProps): React.ReactNode {
  const { data, isLoading, isError } = useProduct(id);
  const { addItem } = useCart();
  const { eligibility, isLoading: membershipLoading } = useMembershipStatus();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <div className="grid gap-10 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data?.product) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-8 text-center text-destructive">
        Produit introuvable.{" "}
        <Link href="/equipment" className="underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const { product } = data;
  const hasSizes = product.sizes.length > 0;
  const stockBySize = new Map(
    (product.productStock ?? []).map((s) => [s.size, s.quantity])
  );
  const selectedStock = selectedSize ? stockBySize.get(selectedSize) ?? 0 : 0;
  const needsSizeSelection = hasSizes && !selectedSize;
  const sizeFromStock = selectedSize !== undefined && selectedStock >= quantity;

  function handleAddToCart(): void {
    if (needsSizeSelection) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      size: selectedSize,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div>
      <Link
        href="/equipment"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Retour au catalogue
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Product image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground"
              >
                <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {product.price.toFixed(2)} €
            </p>
          </div>

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          {/* Size selector with per-size stock indicator */}
          {hasSizes && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Taille{" "}
                {!selectedSize && (
                  <span className="text-muted-foreground">(sélectionner)</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const qty = stockBySize.get(size) ?? 0;
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex flex-col items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary"
                      }`}
                    >
                      <span>{size}</span>
                      <span
                        className={`text-xs ${
                          isSelected
                            ? "opacity-90"
                            : qty > 0
                              ? "text-green-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {qty > 0 ? `${qty} en stock` : "Sur commande"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock / availability info for the selected size */}
          {selectedSize && (
            <div>
              {sizeFromStock ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Disponible immédiatement ({selectedStock} en stock)
                </Badge>
              ) : (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Commande groupée — livré au prochain lot
                </Badge>
              )}
            </div>
          )}

          {/* Quantity selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Quantité</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground hover:border-primary disabled:opacity-50"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(MAX_QUANTITY_PER_ITEM, q + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground hover:border-primary disabled:opacity-50"
                disabled={quantity >= MAX_QUANTITY_PER_ITEM}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart — restricted to members with active subscription */}
          {membershipLoading ? (
            <Skeleton className="h-11 w-full" />
          ) : !eligibility.canOrder ? (
            <div className="space-y-3">
              <Button size="lg" className="w-full" disabled>
                Ajouter au panier
              </Button>
              <p className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                {eligibility.reason === "not_authenticated" && (
                  <>
                    Commandes réservées aux membres.{" "}
                    <Link href="/auth/login" className="font-medium text-primary hover:underline">
                      Se connecter
                    </Link>{" "}
                    ou{" "}
                    <Link href="/auth/register" className="font-medium text-primary hover:underline">
                      créer un compte
                    </Link>
                  </>
                )}
                {(eligibility.reason === "no_membership" ||
                  eligibility.reason === "membership_not_active" ||
                  eligibility.reason === "season_expired") && (
                  <>
                    Commandes réservées aux membres à jour de cotisation.{" "}
                    <Link href="/member/membership" className="font-medium text-primary hover:underline">
                      Régler ma cotisation
                    </Link>
                  </>
                )}
              </p>
            </div>
          ) : (
            <>
              <Button
                size="lg"
                className="w-full"
                disabled={needsSizeSelection}
                onClick={handleAddToCart}
              >
                {added
                  ? "Ajouté au panier !"
                  : needsSizeSelection
                    ? "Sélectionnez une taille"
                    : "Ajouter au panier"}
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/equipment/cart">Voir le panier</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
