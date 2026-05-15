"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product, ProductStock } from "@/types";

interface ProductStockEditorProps {
  productId: string;
  sizes: string[];
  productStock: ProductStock[];
  onSaved?: (product: Product) => void;
}

/**
 * Per-size stock editor for a product. Calls PATCH /api/products/[id]/stock
 * with the full set of (size, quantity) entries in one transaction.
 *
 * Sizes that don't yet have a ProductStock row are shown with quantity 0 — the
 * API upserts so saving creates them.
 */
export function ProductStockEditor({
  productId,
  sizes,
  productStock,
  onSaved,
}: ProductStockEditorProps): React.ReactNode {
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<
    { kind: "ok" | "error"; message: string } | null
  >(null);

  useEffect(() => {
    const stockBySize = new Map(productStock.map((s) => [s.size, s.quantity]));
    const initial: Record<string, string> = {};
    for (const size of sizes) {
      initial[size] = String(stockBySize.get(size) ?? 0);
    }
    setQuantities(initial);
  }, [sizes, productStock]);

  async function handleSave(): Promise<void> {
    setStatus(null);

    const stockPayload: Array<{ size: string; quantity: number }> = [];
    for (const size of sizes) {
      const raw = quantities[size] ?? "0";
      const value = Number(raw);
      if (!Number.isInteger(value) || value < 0) {
        setStatus({
          kind: "error",
          message: `Quantité invalide pour la taille ${size} (entier ≥ 0)`,
        });
        return;
      }
      stockPayload.push({ size, quantity: value });
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: stockPayload }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus({
          kind: "error",
          message: body.error ?? "Échec de l'enregistrement",
        });
        return;
      }
      const { product } = (await res.json()) as { product: Product };
      setStatus({ kind: "ok", message: "Stock enregistré" });
      onSaved?.(product);
    } finally {
      setIsSaving(false);
    }
  }

  if (sizes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune taille déclarée. Ajouter des tailles dans le formulaire ci-dessus pour gérer le stock.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Stock courant par taille. Représente les surplus laissés par les lots fournisseur passés —
        une commande membre dont la taille a du stock part directement en statut « Reçue ».
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sizes.map((size) => (
          <div key={size} className="space-y-1">
            <Label htmlFor={`stock-${size}`}>Taille {size}</Label>
            <Input
              id={`stock-${size}`}
              type="number"
              min="0"
              step="1"
              value={quantities[size] ?? ""}
              onChange={(e) =>
                setQuantities((prev) => ({ ...prev, [size]: e.target.value }))
              }
              disabled={isSaving}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Enregistrement..." : "Enregistrer le stock"}
        </Button>
        {status && (
          <p
            role={status.kind === "error" ? "alert" : "status"}
            className={`text-sm ${
              status.kind === "ok" ? "text-green-500" : "text-destructive"
            }`}
          >
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}
