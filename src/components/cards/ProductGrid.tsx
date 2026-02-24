import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

/**
 * Responsive grid of ProductCard components.
 * Shows skeleton placeholders while loading.
 */
export function ProductGrid({
  products,
  isLoading = false,
}: ProductGridProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-md border border-border p-10 text-center text-muted-foreground">
        Aucun produit disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
