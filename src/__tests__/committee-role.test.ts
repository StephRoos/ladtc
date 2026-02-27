import { describe, it, expect } from "vitest";
import { roleUpdateSchema } from "@/lib/schemas";

describe("roleUpdateSchema — committeeRole", () => {
  it("accepts COMMITTEE role with a committeeRole", () => {
    const result = roleUpdateSchema.safeParse({
      role: "COMMITTEE",
      committeeRole: "Président",
    });
    expect(result.success).toBe(true);
  });

  it("accepts COMMITTEE role without a committeeRole", () => {
    const result = roleUpdateSchema.safeParse({
      role: "COMMITTEE",
    });
    expect(result.success).toBe(true);
  });

  it("accepts COMMITTEE role with committeeRole null", () => {
    const result = roleUpdateSchema.safeParse({
      role: "COMMITTEE",
      committeeRole: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts non-COMMITTEE role without committeeRole", () => {
    const result = roleUpdateSchema.safeParse({
      role: "MEMBER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-COMMITTEE role with a committeeRole", () => {
    const result = roleUpdateSchema.safeParse({
      role: "COACH",
      committeeRole: "Président",
    });
    expect(result.success).toBe(false);
  });

  it("rejects committeeRole longer than 100 characters", () => {
    const result = roleUpdateSchema.safeParse({
      role: "COMMITTEE",
      committeeRole: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("accepts committeeRole of exactly 100 characters", () => {
    const result = roleUpdateSchema.safeParse({
      role: "COMMITTEE",
      committeeRole: "A".repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from committeeRole", () => {
    const result = roleUpdateSchema.safeParse({
      role: "COMMITTEE",
      committeeRole: "  Trésorier  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.committeeRole).toBe("Trésorier");
    }
  });

  it("accepts free-text committeeRole like custom functions", () => {
    const result = roleUpdateSchema.safeParse({
      role: "COMMITTEE",
      committeeRole: "Référent technique",
    });
    expect(result.success).toBe(true);
  });

  it("accepts committeeRole with accented characters", () => {
    const result = roleUpdateSchema.safeParse({
      role: "COMMITTEE",
      committeeRole: "Vice-Président délégué",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role value", () => {
    const result = roleUpdateSchema.safeParse({
      role: "SUPERADMIN",
    });
    expect(result.success).toBe(false);
  });

  it("allows ADMIN role with null committeeRole", () => {
    const result = roleUpdateSchema.safeParse({
      role: "ADMIN",
      committeeRole: null,
    });
    expect(result.success).toBe(true);
  });
});
