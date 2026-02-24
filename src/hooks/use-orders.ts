"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Order } from "@/types";
import type { CheckoutFormData, OrderUpdateFormData } from "@/lib/schemas";
import type { CartItem } from "@/types";

interface OrdersResponse {
  orders: Order[];
  total: number;
  pages: number;
  page: number;
}

interface OrderResponse {
  order: Order;
  orderId?: string;
}

export interface OrdersFilters {
  status?: string;
  page?: number;
}

interface CreateOrderPayload extends CheckoutFormData {
  items: Pick<CartItem, "productId" | "quantity" | "size">[];
}

/**
 * Fetch orders list from the API.
 */
async function fetchOrders(filters: OrdersFilters): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));

  const res = await fetch(`/api/orders?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Impossible de charger les commandes");
  }
  return res.json() as Promise<OrdersResponse>;
}

/**
 * Fetch a single order by ID.
 */
async function fetchOrder(id: string): Promise<OrderResponse> {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) {
    throw new Error("Commande introuvable");
  }
  return res.json() as Promise<OrderResponse>;
}

/**
 * Create a new order.
 */
async function createOrder(data: CreateOrderPayload): Promise<OrderResponse> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de passer la commande");
  }
  return res.json() as Promise<OrderResponse>;
}

/**
 * Update an order (admin only).
 */
async function updateOrder(
  id: string,
  data: OrderUpdateFormData
): Promise<OrderResponse> {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de mettre à jour la commande");
  }
  return res.json() as Promise<OrderResponse>;
}

/**
 * Hook to fetch orders list with optional filters.
 *
 * @param filters - Optional status and page filters
 * @returns TanStack Query result with paginated orders
 */
export function useOrders(filters: OrdersFilters = {}): ReturnType<
  typeof useQuery<OrdersResponse>
> {
  return useQuery<OrdersResponse>({
    queryKey: ["orders", filters],
    queryFn: () => fetchOrders(filters),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single order by ID.
 *
 * @param id - Order ID
 * @returns TanStack Query result with the order
 */
export function useOrder(id: string): ReturnType<typeof useQuery<OrderResponse>> {
  return useQuery<OrderResponse>({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to create a new order from cart items.
 */
export function useCreateOrder(): ReturnType<
  typeof useMutation<OrderResponse, Error, CreateOrderPayload>
> {
  const queryClient = useQueryClient();
  return useMutation<OrderResponse, Error, CreateOrderPayload>({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * Hook to update an order status (admin only).
 */
export function useUpdateOrder(): ReturnType<
  typeof useMutation<OrderResponse, Error, { id: string; data: OrderUpdateFormData }>
> {
  const queryClient = useQueryClient();
  return useMutation<
    OrderResponse,
    Error,
    { id: string; data: OrderUpdateFormData }
  >({
    mutationFn: ({ id, data }) => updateOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });
}
