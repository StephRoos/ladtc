import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCatalog } from "./ProductCatalog";

export const metadata: Metadata = {
  title: "Équipement - LADTC",
  description: "Commandez l'équipement officiel du club LADTC.",
};

/**
 * Public equipment catalog page showing all active products.
 */
export default function EquipmentPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Équipement du club</h1>
        <p className="mt-2 text-muted-foreground">
          Commandez l&apos;équipement officiel LADTC — maillots, vestes, accessoires.
        </p>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Chargement...</div>}>
        <ProductCatalog />
      </Suspense>
    </div>
  );
}
