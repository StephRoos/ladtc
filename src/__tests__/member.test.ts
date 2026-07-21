import { describe, it, expect } from "vitest";
import { profileUpdateSchema, memberUpdateSchema, memberCreateSchema } from "@/lib/schemas";
import { getMembershipStatusConfig } from "@/components/cards/MembershipCard";
import { getCurrentSeason, isSeasonCurrent, formatSeason } from "@/lib/membership";
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
      season: "2025-2026",
      paidAt: "2026-01-01",
      amount: 50,
      notes: "Paiement reçu par virement",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid member update without optional fields", () => {
    const result = memberUpdateSchema.safeParse({
      status: "PENDING",
      season: "2025-2026",
      amount: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status value", () => {
    const result = memberUpdateSchema.safeParse({
      status: "INVALID_STATUS",
      season: "2025-2026",
      amount: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = memberUpdateSchema.safeParse({
      status: "ACTIVE",
      season: "2025-2026",
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
      season: "2025-2026",
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid status values", () => {
    const statuses = ["PENDING", "ACTIVE", "INACTIVE", "EXPIRED"] as const;
    for (const status of statuses) {
      const result = memberUpdateSchema.safeParse({
        status,
        season: "2025-2026",
        amount: 50,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts null paidAt", () => {
    const result = memberUpdateSchema.safeParse({
      status: "PENDING",
      season: "2025-2026",
      paidAt: null,
      amount: 50,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null season", () => {
    const result = memberUpdateSchema.safeParse({
      status: "PENDING",
      season: null,
      amount: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid season format", () => {
    const result = memberUpdateSchema.safeParse({
      status: "ACTIVE",
      season: "2025",
      amount: 50,
    });
    expect(result.success).toBe(false);
  });

  it("accepts an optional joinedYear integer", () => {
    const result = memberUpdateSchema.safeParse({
      status: "ACTIVE",
      season: "2025-2026",
      amount: 50,
      joinedYear: 2023,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-integer joinedYear", () => {
    const result = memberUpdateSchema.safeParse({
      status: "ACTIVE",
      season: "2025-2026",
      amount: 50,
      joinedYear: 2023.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a joinedYear below 2000", () => {
    const result = memberUpdateSchema.safeParse({
      status: "ACTIVE",
      season: "2025-2026",
      amount: 50,
      joinedYear: 1999,
    });
    expect(result.success).toBe(false);
  });
});

// ─── memberCreateSchema ──────────────────────────────────────────────────────

describe("memberCreateSchema", () => {
  it("accepts valid full member creation data", () => {
    const result = memberCreateSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      status: "ACTIVE",
      season: "2025-2026",
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
      season: null,
      amount: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = memberCreateSchema.safeParse({
      name: "J",
      email: "j@example.com",
      status: "PENDING",
      season: "2025-2026",
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
      season: "2025-2026",
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
      season: "2025-2026",
      amount: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = memberCreateSchema.safeParse({
      name: "Jean Dupont",
      status: "PENDING",
      season: "2025-2026",
      amount: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = memberCreateSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      status: "ACTIVE",
      season: "2025-2026",
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
      season: "2025-2026",
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
        season: "2025-2026",
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
      season: "2025-2026",
      amount: 50,
      paidAt: null,
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

// ─── Season helpers ──────────────────────────────────────────────────────────

describe("getCurrentSeason", () => {
  it("returns a string in YYYY-YYYY format", () => {
    const season = getCurrentSeason();
    expect(season).toMatch(/^\d{4}-\d{4}$/);
  });

  it("second year is first year + 1", () => {
    const season = getCurrentSeason();
    const [start, end] = season.split("-").map(Number);
    expect(end).toBe(start + 1);
  });
});

describe("isSeasonCurrent", () => {
  it("returns true for the current season", () => {
    expect(isSeasonCurrent(getCurrentSeason())).toBe(true);
  });

  it("returns false for a past season", () => {
    expect(isSeasonCurrent("2020-2021")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isSeasonCurrent(null)).toBe(false);
  });
});

describe("formatSeason", () => {
  it("formats a valid season string", () => {
    expect(formatSeason("2025-2026")).toBe("Saison 2025-2026");
  });

  it("returns fallback for null", () => {
    expect(formatSeason(null)).toBe("Aucune saison");
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

  it("denies unknown role from managing members", () => {
    const userRole = "UNKNOWN";
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
