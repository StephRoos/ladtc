"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productSchema, type ProductFormData } from "@/lib/schemas";

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Unique"] as const;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

/**
 * Product create/edit form.
 * Uses React Hook Form + Zod validation.
 */
export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  error,
}: ProductFormProps): React.ReactNode {
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    defaultValues?.sizes ?? []
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      active: true,
      sizes: [],
      stock: 0,
      price: 0,
      ...defaultValues,
    },
  });

  const submitting = isSubmitting || formSubmitting;

  function toggleSize(size: string): void {
    const updated = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(updated);
    setValue("sizes", updated);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom du produit</Label>
        <Input
          id="name"
          placeholder="Maillot LADTC 2025"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Description du produit..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Prix (€)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="25.00"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            placeholder="0"
            {...register("stock", { valueAsNumber: true })}
          />
          {errors.stock && (
            <p className="text-sm text-destructive">{errors.stock.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tailles disponibles</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
                selectedSizes.includes(size)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {errors.sizes && (
          <p className="text-sm text-destructive">{errors.sizes.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image (URL)</Label>
        <Input
          id="image"
          type="url"
          placeholder="https://exemple.com/image.jpg"
          {...register("image")}
        />
        {errors.image && (
          <p className="text-sm text-destructive">{errors.image.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sku">Référence (SKU)</Label>
        <Input
          id="sku"
          placeholder="LADTC-MAILLOT-2025"
          {...register("sku")}
        />
        {errors.sku && (
          <p className="text-sm text-destructive">{errors.sku.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="active"
          type="checkbox"
          className="h-4 w-4 rounded border-border"
          defaultChecked={defaultValues?.active ?? true}
          {...register("active")}
        />
        <Label htmlFor="active">Produit actif (visible dans le catalogue)</Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
