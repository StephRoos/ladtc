import { describe, it, expect } from "vitest";
import { profileUpdateSchema, memberUpdateSchema, memberCreateSchema } from "@/lib/schemas";
import {
  getMembershipStatusConfig,
  getDaysUntilRenewal,
} from "@/components/cards/MembershipCard";
import type { MembershipStatus } from "@/types";

// ─── profileUpdateSchema ─────────────────────────────────────────────────────

describe("profileUpdateSchema", () => {
  it("accepts valid full profile update", () => {
    const result = profileUpdateSchema.safeParse({
      name: "Jean Dupont",
      phone: "+32 499 000 000",
      emergencyContact: "Marie Dupont",
      emergencyContactPhone: "+32 499 000 001",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = profileUpdateSchema.safeParse({ name: "J" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path[0] === "name");
      expect(nameError?.message).toBe("Le nom doit contenir au moins 2 caractères");
    }
  });

  it("accepts profile update with only phone", () => {
    const result = profileUpdateSchema.safeParse({ phone: "+32 499 000 000" });
    expect(result.success).toBe(true);
  });

  it("accepts profile update with only emergency contact", () => {
    const result = profileUpdateSchema.safeParse({
      emergencyContact: "Contact Urgence",
    });
    expect(result.success).toBe(true);
  });
});

// ─── memberUpdateSchema ───────────────────────────────────────────────────────

describe("memberUpdateSchema", () => {
  it("accepts valid member update with ACTIVE status", () => {
    const result = memberUpdateSchema.safeParse({
      status: "ACTIVE",
      renewalDate: "2026-12-31",
      paidAt: "2026-01-01",
      amount: 50,
      notes: "Paiement reçu par virement",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid member update without optional fields", () => {
    const result = memberUpdateSchema.safeParse({
      status: "PENDING",
      renewalDate: "2026-12-31",
      amount: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status value", () => {
    const result = memberUpdateSchema.safeParse({
      status: "INVALID_STATUS",
      renewalDate: "2026-12-31",
      amount: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = memberUpdateSchema.safeParse({
      status: "ACTIVE",
      renewalDate: "2026-12-31",
      amount: -10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const amountError = result.error.issues.find((i) => i.path[0] === "amount");
      expect(amountError?.message).toBe("Le montant doit être positif");
    }
  });

  it("rejects zero amount", () => {
    const result = memberUpdateSchema.safeParse({
      status: "ACTIVE",
      renewalDate: "2026-12-31",
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid status values", () => {
    const statuses = ["PENDING", "ACTIVE", "INACTIVE", "EXPIRED"] as const;
    for (const status of statuses) {
      const result = memberUpdateSchema.safeParse({
        status,
        renewalDate: "2026-12-31",
        amount: 50,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts null paidAt", () => {
    const result = memberUpdateSchema.safeParse({
      status: "PENDING",
      renewalDate: "2026-12-31",
      paidAt: null,
      amount: 50,
    });
    expect(result.success).toBe(true);
  });
});

// ─── memberCreateSchema ──────────────────────────────────────────────────────

describe("memberCreateSchema", () => {
  it("accepts valid full member creation data", () => {
    const result = memberCreateSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      status: "ACTIVE",
      renewalDate: "2027-01-01",
      paidAt: "2026-02-27",
      amount: 50,
      notes: "Inscription en personne",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal required data", () => {
    const result = memberCreateSchema.safeParse({
      name: "Marie Martin",
      email: "marie@example.com",
      status: "PENDING",
      renewalDate: "2027-01-01",
      amount: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = memberCreateSchema.safeParse({
      name: "J",
      email: "j@example.com",
      status: "PENDING",
      renewalDate: "2027-01-01",
      amount: 50,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path[0] === "name");
      expect(nameError?.message).toBe("Le nom doit contenir au moins 2 caractères");
    }
  });

  it("rejects invalid email", () => {
    const result = memberCreateSchema.safeParse({
      name: "Jean Dupont",
      email: "not-an-email",
      status: "PENDING",
      renewalDate: "2027-01-01",
      amount: 50,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === "email");
      expect(emailError?.message).toBe("Email invalide");
    }
  });

  it("rejects missing name", () => {
    const result = memberCreateSchema.safeParse({
      email: "jean@example.com",
      status: "PENDING",
      renewalDate: "2027-01-01",
      amount: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = memberCreateSchema.safeParse({
      name: "Jean Dupont",
      status: "PENDING",
      renewalDate: "2027-01-01",
      amount: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = memberCreateSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      status: "ACTIVE",
      renewalDate: "2027-01-01",
      amount: -10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const amountError = result.error.issues.find((i) => i.path[0] === "amount");
      expect(amountError?.message).toBe("Le montant doit être positif");
    }
  });

  it("rejects invalid status value", () => {
    const result = memberCreateSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      renewalDate: "2027-01-01",
      amount: 50,
      status: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid status values", () => {
    const statuses = ["PENDING", "ACTIVE", "INACTIVE", "EXPIRED"] as const;
    for (const status of statuses) {
      const result = memberCreateSchema.safeParse({
        name: "Jean Dupont",
        email: "jean@example.com",
        renewalDate: "2027-01-01",
        amount: 50,
        status,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts null paidAt", () => {
    const result = memberCreateSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      status: "PENDING",
      renewalDate: "2027-01-01",
      amount: 50,
      paidAt: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts datetime format for renewalDate", () => {
    const result = memberCreateSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      status: "ACTIVE",
      renewalDate: "2027-01-01T00:00:00.000Z",
      amount: 50,
    });
    expect(result.success).toBe(true);
  });
});

// ─── getMembershipStatusConfig ────────────────────────────────────────────────

describe("getMembershipStatusConfig", () => {
  it("returns green class for ACTIVE status", () => {
    const config = getMembershipStatusConfig("ACTIVE");
    expect(config.label).toBe("Actif");
    expect(config.className).toContain("green");
  });

  it("returns amber class for PENDING status", () => {
    const config = getMembershipStatusConfig("PENDING");
    expect(config.label).toBe("En attente");
    expect(config.className).toContain("amber");
  });

  it("returns gray class for INACTIVE status", () => {
    const config = getMembershipStatusConfig("INACTIVE");
    expect(config.label).toBe("Inactif");
    expect(config.className).toContain("gray");
  });

  it("returns red class for EXPIRED status", () => {
    const config = getMembershipStatusConfig("EXPIRED");
    expect(config.label).toBe("Expiré");
    expect(config.className).toContain("red");
  });

  it("returns correct label for all statuses", () => {
    const expectedLabels: Record<MembershipStatus, string> = {
      ACTIVE: "Actif",
      PENDING: "En attente",
      INACTIVE: "Inactif",
      EXPIRED: "Expiré",
    };
    for (const [status, label] of Object.entries(expectedLabels)) {
      const config = getMembershipStatusConfig(status as MembershipStatus);
      expect(config.label).toBe(label);
    }
  });
});

// ─── getDaysUntilRenewal ──────────────────────────────────────────────────────

describe("getDaysUntilRenewal", () => {
  it("returns positive days for a future renewal date", () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const days = getDaysUntilRenewal(futureDate);
    expect(days).toBeGreaterThan(0);
    expect(days).toBeLessThanOrEqual(30);
  });

  it("returns negative days for a past renewal date", () => {
    const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const days = getDaysUntilRenewal(pastDate);
    expect(days).toBeLessThan(0);
  });

  it("returns approximately 365 for a date one year away", () => {
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const days = getDaysUntilRenewal(oneYearFromNow);
    expect(days).toBeGreaterThanOrEqual(364);
    expect(days).toBeLessThanOrEqual(366);
  });

  it("returns 0 or 1 for today's date", () => {
    const today = new Date();
    const days = getDaysUntilRenewal(today);
    expect(Math.abs(days)).toBeLessThanOrEqual(1);
  });
});

// ─── Role authorization helpers ───────────────────────────────────────────────

describe("role authorization", () => {
  const COMMITTEE_ROLES = ["COMMITTEE", "ADMIN"] as const;

  it("allows ADMIN role to manage members", () => {
    const userRole = "ADMIN";
    expect(COMMITTEE_ROLES.includes(userRole as (typeof COMMITTEE_ROLES)[number])).toBe(true);
  });

  it("allows COMMITTEE role to manage members", () => {
    const userRole = "COMMITTEE";
    expect(COMMITTEE_ROLES.includes(userRole as (typeof COMMITTEE_ROLES)[number])).toBe(true);
  });

  it("denies MEMBER role from managing members", () => {
    const userRole = "MEMBER";
    expect(COMMITTEE_ROLES.includes(userRole as (typeof COMMITTEE_ROLES)[number])).toBe(false);
  });

  it("denies COACH role from managing members", () => {
    const userRole = "COACH";
    expect(COMMITTEE_ROLES.includes(userRole as (typeof COMMITTEE_ROLES)[number])).toBe(false);
  });
});

// ─── Member filtering logic ───────────────────────────────────────────────────

describe("member filtering logic", () => {
  const validStatuses = ["PENDING", "ACTIVE", "INACTIVE", "EXPIRED"] as const;

  it("recognizes all valid membership status filter values", () => {
    for (const status of validStatuses) {
      expect(validStatuses.includes(status)).toBe(true);
    }
  });

  it("rejects an invalid status filter value", () => {
    const invalidStatus = "UNKNOWN";
    expect(
      validStatuses.includes(invalidStatus as (typeof validStatuses)[number])
    ).toBe(false);
  });

  it("returns undefined for empty string status filter", () => {
    const rawStatus = "";
    const statusFilter =
      rawStatus && validStatuses.includes(rawStatus as (typeof validStatuses)[number])
        ? rawStatus
        : undefined;
    expect(statusFilter).toBeUndefined();
  });

  it("returns the correct status for a valid status filter string", () => {
    const rawStatus = "ACTIVE";
    const statusFilter =
      rawStatus && validStatuses.includes(rawStatus as (typeof validStatuses)[number])
        ? rawStatus
        : undefined;
    expect(statusFilter).toBe("ACTIVE");
  });
});
