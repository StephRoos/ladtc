"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductGrid } from "@/components/cards/ProductGrid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "name" | "price_asc" | "price_desc";

/**
 * Client component for the product catalog with sorting controls.
 */
export function ProductCatalog(): React.ReactNode {
  const [sort, setSort] = useState<SortOption>("name");

  const { data, isLoading, isError } = useProducts({ active: true, sort });

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-8 text-center text-destructive">
        Impossible de charger les produits. Veuillez réessayer.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Chargement..." : `${data?.total ?? 0} produit(s)`}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trier par :</span>
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as SortOption)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ProductGrid products={data?.products ?? []} isLoading={isLoading} />
    </div>
  );
}
