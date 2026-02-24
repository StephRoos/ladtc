"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@/types";
import type { ProductFormData } from "@/lib/schemas";

interface ProductsResponse {
  products: Product[];
  total: number;
}

interface ProductResponse {
  product: Product;
}

export interface ProductsFilters {
  active?: boolean;
  skip?: number;
  take?: number;
  sort?: "name" | "price_asc" | "price_desc";
}

/**
 * Fetch products list from the API.
 */
async function fetchProducts(filters: ProductsFilters): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (filters.active !== undefined) params.set("active", String(filters.active));
  if (filters.skip !== undefined) params.set("skip", String(filters.skip));
  if (filters.take !== undefined) params.set("take", String(filters.take));
  if (filters.sort) params.set("sort", filters.sort);

  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Impossible de charger les produits");
  }
  return res.json() as Promise<ProductsResponse>;
}

/**
 * Fetch a single product by ID.
 */
async function fetchProduct(id: string): Promise<ProductResponse> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) {
    throw new Error("Produit introuvable");
  }
  return res.json() as Promise<ProductResponse>;
}

/**
 * Create a new product (admin only).
 */
async function createProduct(data: ProductFormData): Promise<ProductResponse> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de créer le produit");
  }
  return res.json() as Promise<ProductResponse>;
}

/**
 * Update an existing product (admin only).
 */
async function updateProduct(
  id: string,
  data: Partial<ProductFormData>
): Promise<ProductResponse> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de mettre à jour le produit");
  }
  return res.json() as Promise<ProductResponse>;
}

/**
 * Soft-delete a product (admin only).
 */
async function deleteProduct(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de supprimer le produit");
  }
  return res.json() as Promise<{ success: boolean }>;
}

/**
 * Hook to fetch a paginated list of products.
 *
 * @param filters - Optional filters (active, skip, take, sort)
 * @returns TanStack Query result with products
 */
export function useProducts(filters: ProductsFilters = {}): ReturnType<
  typeof useQuery<ProductsResponse>
> {
  return useQuery<ProductsResponse>({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single product by ID.
 *
 * @param id - Product ID
 * @returns TanStack Query result with the product
 */
export function useProduct(id: string): ReturnType<typeof useQuery<ProductResponse>> {
  return useQuery<ProductResponse>({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new product.
 */
export function useCreateProduct(): ReturnType<
  typeof useMutation<ProductResponse, Error, ProductFormData>
> {
  const queryClient = useQueryClient();
  return useMutation<ProductResponse, Error, ProductFormData>({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Hook to update an existing product.
 */
export function useUpdateProduct(): ReturnType<
  typeof useMutation<ProductResponse, Error, { id: string; data: Partial<ProductFormData> }>
> {
  const queryClient = useQueryClient();
  return useMutation<
    ProductResponse,
    Error,
    { id: string; data: Partial<ProductFormData> }
  >({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
}

/**
 * Hook to soft-delete a product.
 */
export function useDeleteProduct(): ReturnType<
  typeof useMutation<{ success: boolean }, Error, string>
> {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
