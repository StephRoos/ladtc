"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductDetailProps {
  id: string;
}

/**
 * Client component for product detail with size selector, quantity, and add-to-cart.
 */
export function ProductDetail({ id }: ProductDetailProps): React.ReactNode {
  const { data, isLoading, isError } = useProduct(id);
  const { addItem } = useCart();
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
  const inStock = product.stock > 0;
  const needsSizeSelection = hasSizes && !selectedSize;

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
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
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

          {/* Stock status */}
          <div>
            {inStock ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {product.stock} en stock
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                Rupture de stock
              </Badge>
            )}
          </div>

          {/* Size selector */}
          {hasSizes && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Taille{" "}
                {!selectedSize && (
                  <span className="text-muted-foreground">(sélectionner)</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
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
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground hover:border-primary disabled:opacity-50"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart button */}
          <Button
            size="lg"
            className="w-full"
            disabled={!inStock || needsSizeSelection}
            onClick={handleAddToCart}
          >
            {added
              ? "Ajouté au panier !"
              : !inStock
                ? "Rupture de stock"
                : needsSizeSelection
                  ? "Sélectionnez une taille"
                  : "Ajouter au panier"}
          </Button>

          {inStock && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/equipment/cart">Voir le panier</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
