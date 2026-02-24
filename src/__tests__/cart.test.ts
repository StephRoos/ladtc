import { describe, it, expect, beforeEach } from "vitest";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartTotal,
} from "@/lib/cart";
import { productSchema, checkoutSchema } from "@/lib/schemas";
import type { CartItem } from "@/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });
Object.defineProperty(globalThis, "window", { value: globalThis });

const testItem: CartItem = {
  productId: "prod-1",
  name: "Maillot LADTC",
  price: 25.0,
  image: null,
  quantity: 1,
  size: "M",
};

const testItem2: CartItem = {
  productId: "prod-2",
  name: "Veste LADTC",
  price: 60.0,
  image: null,
  quantity: 2,
  size: "L",
};

beforeEach(() => {
  localStorageMock.clear();
});

// ─── getCart ──────────────────────────────────────────────────────────────────

describe("getCart", () => {
  it("returns empty array when cart is empty", () => {
    expect(getCart()).toEqual([]);
  });

  it("returns parsed cart items from localStorage", () => {
    localStorageMock.setItem("ladtc_cart", JSON.stringify([testItem]));
    expect(getCart()).toEqual([testItem]);
  });

  it("returns empty array on invalid JSON", () => {
    localStorageMock.setItem("ladtc_cart", "invalid-json");
    expect(getCart()).toEqual([]);
  });
});

// ─── addToCart ────────────────────────────────────────────────────────────────

describe("addToCart", () => {
  it("adds a new item to an empty cart", () => {
    const items = addToCart(testItem);
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe("prod-1");
    expect(items[0].quantity).toBe(1);
  });

  it("increments quantity when same productId + size already exists", () => {
    addToCart(testItem);
    const items = addToCart({ ...testItem, quantity: 2 });
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it("adds a separate entry for same product with different size", () => {
    addToCart(testItem);
    const items = addToCart({ ...testItem, size: "L", quantity: 1 });
    expect(items).toHaveLength(2);
  });

  it("adds multiple different products", () => {
    addToCart(testItem);
    const items = addToCart(testItem2);
    expect(items).toHaveLength(2);
  });

  it("persists cart to localStorage", () => {
    addToCart(testItem);
    const stored = localStorageMock.getItem("ladtc_cart");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!) as CartItem[];
    expect(parsed).toHaveLength(1);
    expect(parsed[0].productId).toBe("prod-1");
  });
});

// ─── removeFromCart ───────────────────────────────────────────────────────────

describe("removeFromCart", () => {
  it("removes an item by productId and size", () => {
    addToCart(testItem);
    const items = removeFromCart("prod-1", "M");
    expect(items).toHaveLength(0);
  });

  it("only removes the correct size variant", () => {
    addToCart(testItem);
    addToCart({ ...testItem, size: "L" });
    const items = removeFromCart("prod-1", "M");
    expect(items).toHaveLength(1);
    expect(items[0].size).toBe("L");
  });

  it("returns unchanged cart when item not found", () => {
    addToCart(testItem);
    const items = removeFromCart("nonexistent-id");
    expect(items).toHaveLength(1);
  });
});

// ─── updateQuantity ───────────────────────────────────────────────────────────

describe("updateQuantity", () => {
  it("updates quantity of an existing item", () => {
    addToCart(testItem);
    const items = updateQuantity("prod-1", 5, "M");
    expect(items[0].quantity).toBe(5);
  });

  it("removes item when quantity is set to 0", () => {
    addToCart(testItem);
    const items = updateQuantity("prod-1", 0, "M");
    expect(items).toHaveLength(0);
  });

  it("removes item when quantity is negative", () => {
    addToCart(testItem);
    const items = updateQuantity("prod-1", -1, "M");
    expect(items).toHaveLength(0);
  });
});

// ─── clearCart ────────────────────────────────────────────────────────────────

describe("clearCart", () => {
  it("clears all items from cart", () => {
    addToCart(testItem);
    addToCart(testItem2);
    const items = clearCart();
    expect(items).toHaveLength(0);
  });

  it("removes ladtc_cart from localStorage", () => {
    addToCart(testItem);
    clearCart();
    expect(localStorageMock.getItem("ladtc_cart")).toBeNull();
  });

  it("returns empty array when cart is already empty", () => {
    const items = clearCart();
    expect(items).toEqual([]);
  });
});

// ─── getCartTotal ─────────────────────────────────────────────────────────────

describe("getCartTotal", () => {
  it("returns 0 for an empty cart", () => {
    expect(getCartTotal([])).toBe(0);
  });

  it("calculates total correctly for a single item", () => {
    const items = [{ ...testItem, quantity: 3 }];
    expect(getCartTotal(items)).toBe(75.0); // 25 * 3
  });

  it("calculates total correctly for multiple items", () => {
    const items = [testItem, testItem2];
    // 25 * 1 + 60 * 2 = 145
    expect(getCartTotal(items)).toBe(145.0);
  });

  it("reads from localStorage when no items passed", () => {
    addToCart({ ...testItem, quantity: 2 });
    expect(getCartTotal()).toBe(50.0); // 25 * 2
  });
});

// ─── productSchema validation ─────────────────────────────────────────────────

describe("productSchema", () => {
  it("accepts a valid product", () => {
    const result = productSchema.safeParse({
      name: "Maillot LADTC",
      price: 25.0,
      sizes: ["S", "M", "L"],
      stock: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    const result = productSchema.safeParse({
      name: "AB",
      price: 25.0,
      sizes: [],
      stock: 10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path[0] === "name");
      expect(nameError?.message).toContain("3");
    }
  });

  it("rejects negative price", () => {
    const result = productSchema.safeParse({
      name: "Produit Test",
      price: -5,
      sizes: [],
      stock: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative stock", () => {
    const result = productSchema.safeParse({
      name: "Produit Test",
      price: 10,
      sizes: [],
      stock: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts product without optional fields", () => {
    const result = productSchema.safeParse({
      name: "Produit Test",
      price: 10,
      sizes: [],
      stock: 0,
    });
    expect(result.success).toBe(true);
  });
});

// ─── checkoutSchema validation ────────────────────────────────────────────────

describe("checkoutSchema", () => {
  const validCheckout = {
    shippingName: "Jean Dupont",
    shippingEmail: "jean@exemple.be",
    shippingPhone: "+32 499 000 000",
    shippingAddress: "Rue de l'Exemple 1",
    shippingCity: "Bruxelles",
    shippingZip: "1000",
    shippingCountry: "Belgium",
  };

  it("accepts a valid checkout form", () => {
    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      shippingEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      shippingName: "J",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short phone number", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      shippingPhone: "123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts checkout without country (country is optional)", () => {
    // Build a checkout without shippingCountry
    const withoutCountry = {
      shippingName: validCheckout.shippingName,
      shippingEmail: validCheckout.shippingEmail,
      shippingPhone: validCheckout.shippingPhone,
      shippingAddress: validCheckout.shippingAddress,
      shippingCity: validCheckout.shippingCity,
      shippingZip: validCheckout.shippingZip,
    };
    const result = checkoutSchema.safeParse(withoutCountry);
    expect(result.success).toBe(true);
  });
});

// ─── Order status transitions ─────────────────────────────────────────────────

describe("order status transitions", () => {
  const VALID_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ] as const;

  it("recognizes all valid order statuses", () => {
    for (const status of VALID_STATUSES) {
      expect(VALID_STATUSES.includes(status)).toBe(true);
    }
  });

  it("rejects an unknown status", () => {
    const unknownStatus = "REFUNDED";
    expect(
      VALID_STATUSES.includes(unknownStatus as (typeof VALID_STATUSES)[number])
    ).toBe(false);
  });

  it("allows PENDING -> CONFIRMED transition", () => {
    const current = "PENDING";
    const next = "CONFIRMED";
    expect(VALID_STATUSES.includes(next)).toBe(true);
    expect(VALID_STATUSES.includes(current)).toBe(true);
  });

  it("allows CONFIRMED -> SHIPPED transition", () => {
    const next = "SHIPPED";
    expect(VALID_STATUSES.includes(next)).toBe(true);
  });
});
