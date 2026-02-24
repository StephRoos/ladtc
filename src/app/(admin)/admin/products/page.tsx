"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/use-products";
import { ProductTable } from "@/components/admin/ProductTable";
import { Button } from "@/components/ui/button";

/**
 * Admin products management page.
 */
export default function AdminProductsPage(): React.ReactNode {
  const { data, isLoading, isError } = useProducts({ active: undefined });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Produits</h1>
        <Button asChild>
          <Link href="/admin/products/new">Nouveau produit</Link>
        </Button>
      </div>

      {isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-4 text-destructive">
          Impossible de charger les produits.
        </div>
      ) : (
        <ProductTable products={data?.products ?? []} isLoading={isLoading} />
      )}
    </div>
  );
}
