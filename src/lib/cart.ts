import type { CartItem } from "@/types";

const CART_KEY = "ladtc_cart";

/**
 * Read the current cart from localStorage.
 * Returns an empty array if no cart is found or parsing fails.
 *
 * @returns Array of cart items
 */
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

/**
 * Persist the cart array to localStorage.
 *
 * @param items - Cart items to save
 */
function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

/**
 * Add a product to the cart or increment its quantity if already present.
 * A cart item is uniquely identified by (productId + size).
 *
 * @param item - The cart item to add
 * @returns Updated cart items
 */
export function addToCart(item: CartItem): CartItem[] {
  const items = getCart();
  const existing = items.find(
    (i) => i.productId === item.productId && i.size === item.size
  );

  if (existing) {
    existing.quantity += item.quantity;
    saveCart(items);
    return [...items];
  }

  const updated = [...items, { ...item }];
  saveCart(updated);
  return updated;
}

/**
 * Remove an item from the cart by productId and optional size.
 *
 * @param productId - The product ID to remove
 * @param size - The size variant to remove (optional)
 * @returns Updated cart items
 */
export function removeFromCart(productId: string, size?: string): CartItem[] {
  const items = getCart();
  const updated = items.filter(
    (i) => !(i.productId === productId && i.size === size)
  );
  saveCart(updated);
  return updated;
}

/**
 * Update the quantity of a specific cart item.
 * If the quantity is 0 or less, the item is removed.
 *
 * @param productId - The product ID
 * @param quantity - The new quantity
 * @param size - The size variant (optional)
 * @returns Updated cart items
 */
export function updateQuantity(
  productId: string,
  quantity: number,
  size?: string
): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(productId, size);
  }

  const items = getCart();
  const updated = items.map((i) =>
    i.productId === productId && i.size === size ? { ...i, quantity } : i
  );
  saveCart(updated);
  return updated;
}

/**
 * Clear all items from the cart.
 *
 * @returns Empty array
 */
export function clearCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  localStorage.removeItem(CART_KEY);
  return [];
}

/**
 * Calculate the total price of all items in the cart.
 *
 * @param items - Cart items (defaults to reading from localStorage)
 * @returns Total price
 */
export function getCartTotal(items?: CartItem[]): number {
  const cartItems = items ?? getCart();
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
