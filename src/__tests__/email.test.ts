import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  welcomeEmailTemplate,
  renewalReminderTemplate,
  orderConfirmationTemplate,
  orderStatusTemplate,
} from "@/lib/email-templates";
import type { Order, OrderItem, Product, User } from "@/types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser: User = {
  id: "user-1",
  email: "jean.dupont@example.be",
  emailVerified: true,
  name: "Jean Dupont",
  image: null,
  role: "MEMBER",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

const mockProduct: Product = {
  id: "prod-1",
  name: "Maillot LADTC",
  description: "Maillot technique",
  price: 25.0,
  image: null,
  sizes: ["M", "L"],
  stock: 10,
  sku: "LADTC-001",
  active: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

const mockOrderItem: OrderItem = {
  id: "item-1",
  orderId: "order-abcdef01",
  productId: "prod-1",
  product: mockProduct,
  quantity: 2,
  size: "M",
  price: 25.0,
};

const mockOrder: Order = {
  id: "order-abcdef01",
  userId: "user-1",
  user: mockUser,
  items: [mockOrderItem],
  status: "CONFIRMED",
  subtotal: 50.0,
  shippingCost: 0.0,
  tax: 0.0,
  total: 50.0,
  shippingName: "Jean Dupont",
  shippingEmail: "jean.dupont@example.be",
  shippingPhone: "+32 499 000 000",
  shippingAddress: "Rue de l'Exemple 1",
  shippingCity: "Bruxelles",
  shippingZip: "1000",
  shippingCountry: "Belgium",
  notes: null,
  trackingNumber: null,
  shippedAt: null,
  deliveredAt: null,
  createdAt: new Date("2025-06-01"),
  updatedAt: new Date("2025-06-01"),
};

// ─── welcomeEmailTemplate ─────────────────────────────────────────────────────

describe("welcomeEmailTemplate", () => {
  it("contains the user name in the output", () => {
    const html = welcomeEmailTemplate("Jean Dupont");
    expect(html).toContain("Jean Dupont");
  });

  it("contains LADTC branding", () => {
    const html = welcomeEmailTemplate("Marie");
    expect(html).toContain("LADTC");
    expect(html).toContain("Les Amis Du Trail des Collines");
  });

  it("contains the club contact email", () => {
    const html = welcomeEmailTemplate("Test");
    expect(html).toContain("bureau@ladtc.be");
  });

  it("returns a valid HTML string", () => {
    const html = welcomeEmailTemplate("Test");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });
});

// ─── renewalReminderTemplate ──────────────────────────────────────────────────

describe("renewalReminderTemplate", () => {
  it("contains the member name", () => {
    const html = renewalReminderTemplate("Sophie Martin", "01/03/2026", 50);
    expect(html).toContain("Sophie Martin");
  });

  it("contains the renewal date", () => {
    const html = renewalReminderTemplate("Sophie", "01/03/2026", 50);
    expect(html).toContain("01/03/2026");
  });

  it("contains the membership amount", () => {
    const html = renewalReminderTemplate("Sophie", "01/03/2026", 50);
    expect(html).toContain("50.00");
  });

  it("contains EUR currency", () => {
    const html = renewalReminderTemplate("Sophie", "01/03/2026", 75);
    expect(html).toContain("EUR");
  });
});

// ─── orderConfirmationTemplate ────────────────────────────────────────────────

describe("orderConfirmationTemplate", () => {
  it("contains the product name", () => {
    const html = orderConfirmationTemplate(mockOrder);
    expect(html).toContain("Maillot LADTC");
  });

  it("contains the order total", () => {
    const html = orderConfirmationTemplate(mockOrder);
    expect(html).toContain("50.00");
  });

  it("contains the shipping address", () => {
    const html = orderConfirmationTemplate(mockOrder);
    expect(html).toContain("Bruxelles");
    expect(html).toContain("Jean Dupont");
  });

  it("contains the order id reference", () => {
    const html = orderConfirmationTemplate(mockOrder);
    expect(html).toContain("ABCDEF01");
  });

  it("displays free shipping when shippingCost is 0", () => {
    const html = orderConfirmationTemplate(mockOrder);
    expect(html).toContain("Gratuit");
  });
});

// ─── orderStatusTemplate ──────────────────────────────────────────────────────

describe("orderStatusTemplate", () => {
  it("contains the shipped status label", () => {
    const html = orderStatusTemplate(mockOrder, "SHIPPED");
    expect(html).toContain("expédiée");
  });

  it("contains the delivered status label", () => {
    const html = orderStatusTemplate(mockOrder, "DELIVERED");
    expect(html).toContain("livrée");
  });

  it("contains the order id reference", () => {
    const html = orderStatusTemplate(mockOrder, "SHIPPED");
    expect(html).toContain("ABCDEF01");
  });

  it("shows tracking number when available", () => {
    const orderWithTracking = { ...mockOrder, trackingNumber: "TRK123456789" };
    const html = orderStatusTemplate(orderWithTracking, "SHIPPED");
    expect(html).toContain("TRK123456789");
  });
});

// ─── sendEmail fallback behaviour ─────────────────────────────────────────────

describe("sendEmail fallback", () => {
  beforeEach(() => {
    // Ensure RESEND_API_KEY is not set for fallback tests
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs to console and does not throw when RESEND_API_KEY is not set", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { sendEmail } = await import("@/lib/email");

    await expect(
      sendEmail("test@example.com", "Test subject", "<p>Hello</p>")
    ).resolves.not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("RESEND_API_KEY not set")
    );
  });
});
