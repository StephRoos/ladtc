"use client";

import { useState } from "react";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartTotal,
} from "@/lib/cart";
import type { CartItem } from "@/types";

interface UseCartReturn {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clear: () => void;
  total: number;
  itemCount: number;
}

/**
 * React hook wrapping localStorage cart utilities with state management.
 * Uses a lazy initializer so the cart is read from localStorage on first render.
 * Triggers re-renders when the cart changes.
 *
 * @returns Cart state and mutation functions
 */
export function useCart(): UseCartReturn {
  // Lazy initializer — only called once, safely reads localStorage on client
  const [items, setItems] = useState<CartItem[]>(() => getCart());

  function addItem(item: CartItem): void {
    const updated = addToCart(item);
    setItems(updated);
  }

  function removeItem(productId: string, size?: string): void {
    const updated = removeFromCart(productId, size);
    setItems(updated);
  }

  function handleUpdateQuantity(
    productId: string,
    quantity: number,
    size?: string
  ): void {
    const updated = updateQuantity(productId, quantity, size);
    setItems(updated);
  }

  function clear(): void {
    const updated = clearCart();
    setItems(updated);
  }

  const total = getCartTotal(items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity: handleUpdateQuantity,
    clear,
    total,
    itemCount,
  };
}
