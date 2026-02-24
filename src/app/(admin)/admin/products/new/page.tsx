"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateProduct } from "@/hooks/use-products";
import { ProductForm } from "@/components/forms/ProductForm";
import type { ProductFormData } from "@/lib/schemas";

/**
 * Admin create product page.
 */
export default function NewProductPage(): React.ReactNode {
  const router = useRouter();
  const createProduct = useCreateProduct();

  async function handleSubmit(data: ProductFormData): Promise<void> {
    await createProduct.mutateAsync(data);
    router.push("/admin/products");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Retour aux produits
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Nouveau produit</h1>
      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={createProduct.isPending}
        error={createProduct.error?.message}
      />
    </div>
  );
}
