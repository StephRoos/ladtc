"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";
import { ProductForm } from "@/components/forms/ProductForm";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductFormData } from "@/lib/schemas";

/**
 * Admin edit product page.
 */
export default function EditProductPage(): React.ReactNode {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useProduct(id);
  const updateProduct = useUpdateProduct();

  async function handleSubmit(formData: ProductFormData): Promise<void> {
    await updateProduct.mutateAsync({ id, data: formData });
    router.push("/admin/products");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data?.product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-muted-foreground">Produit introuvable.</p>
        <Link
          href="/admin/products"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Retour aux produits
        </Link>
      </div>
    );
  }

  const { product } = data;
  const defaultValues: ProductFormData = {
    name: product.name,
    description: product.description ?? undefined,
    price: product.price,
    sizes: product.sizes,
    stock: product.stock,
    image: product.image ?? "",
    sku: product.sku ?? undefined,
    active: product.active,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Retour aux produits
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Modifier le produit</h1>
      <ProductForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={updateProduct.isPending}
        error={updateProduct.error?.message}
      />
    </div>
  );
}
