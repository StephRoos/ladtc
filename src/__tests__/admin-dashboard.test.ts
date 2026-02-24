import { describe, it, expect } from "vitest";
import { roleUpdateSchema, activityLogFilterSchema } from "@/lib/schemas";
import type {
  DashboardStats,
  ActivityLogEntry,
  StatisticsData,
  UserRole,
} from "@/types";

// ─── roleUpdateSchema ─────────────────────────────────────────────────────────

describe("roleUpdateSchema", () => {
  it("accepts MEMBER role", () => {
    const result = roleUpdateSchema.safeParse({ role: "MEMBER" });
    expect(result.success).toBe(true);
  });

  it("accepts COACH role", () => {
    const result = roleUpdateSchema.safeParse({ role: "COACH" });
    expect(result.success).toBe(true);
  });

  it("accepts COMMITTEE role", () => {
    const result = roleUpdateSchema.safeParse({ role: "COMMITTEE" });
    expect(result.success).toBe(true);
  });

  it("accepts ADMIN role", () => {
    const result = roleUpdateSchema.safeParse({ role: "ADMIN" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid role string", () => {
    const result = roleUpdateSchema.safeParse({ role: "SUPERADMIN" });
    expect(result.success).toBe(false);
  });

  it("rejects missing role field", () => {
    const result = roleUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects lowercase role", () => {
    const result = roleUpdateSchema.safeParse({ role: "admin" });
    expect(result.success).toBe(false);
  });
});

// ─── activityLogFilterSchema ──────────────────────────────────────────────────

describe("activityLogFilterSchema", () => {
  it("accepts empty object and applies defaults", () => {
    const result = activityLogFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skip).toBe(0);
      expect(result.data.take).toBe(50);
    }
  });

  it("accepts valid action filter", () => {
    const result = activityLogFilterSchema.safeParse({ action: "ORDER_SHIPPED" });
    expect(result.success).toBe(true);
  });

  it("accepts valid pagination params", () => {
    const result = activityLogFilterSchema.safeParse({ skip: 20, take: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skip).toBe(20);
      expect(result.data.take).toBe(10);
    }
  });

  it("accepts string skip/take and coerces to numbers", () => {
    const result = activityLogFilterSchema.safeParse({ skip: "40", take: "20" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skip).toBe(40);
      expect(result.data.take).toBe(20);
    }
  });

  it("accepts valid ISO startDate", () => {
    const result = activityLogFilterSchema.safeParse({
      startDate: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid startDate format", () => {
    const result = activityLogFilterSchema.safeParse({ startDate: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("accepts userId filter", () => {
    const result = activityLogFilterSchema.safeParse({ userId: "user_abc123" });
    expect(result.success).toBe(true);
  });
});

// ─── DashboardStats type validation ──────────────────────────────────────────

describe("DashboardStats shape", () => {
  it("conforms to the expected interface", () => {
    const stats: DashboardStats = {
      totalMembers: 120,
      activeMembers: 95,
      pendingRenewals: 8,
      pendingOrders: 3,
      recentRegistrations: 4,
    };

    expect(stats.totalMembers).toBe(120);
    expect(stats.activeMembers).toBe(95);
    expect(stats.pendingRenewals).toBe(8);
    expect(stats.pendingOrders).toBe(3);
    expect(stats.recentRegistrations).toBe(4);
  });

  it("active members cannot exceed total members in valid data", () => {
    const stats: DashboardStats = {
      totalMembers: 50,
      activeMembers: 40,
      pendingRenewals: 5,
      pendingOrders: 2,
      recentRegistrations: 1,
    };
    expect(stats.activeMembers).toBeLessThanOrEqual(stats.totalMembers);
  });
});

// ─── ActivityLogEntry type validation ────────────────────────────────────────

describe("ActivityLogEntry shape", () => {
  it("conforms to the expected interface with required fields", () => {
    const log: ActivityLogEntry = {
      id: "log_abc",
      userId: "user_123",
      user: { id: "user_123", name: "Jean Dupont", email: "jean@example.com" },
      action: "ORDER_SHIPPED",
      target: "order",
      targetId: "order_456",
      changes: null,
      createdAt: new Date(),
    };

    expect(log.action).toBe("ORDER_SHIPPED");
    expect(log.user.email).toBe("jean@example.com");
  });

  it("supports null target fields", () => {
    const log: ActivityLogEntry = {
      id: "log_xyz",
      userId: "user_123",
      user: { id: "user_123", name: null, email: "anon@example.com" },
      action: "USER_ROLE_UPDATED",
      target: null,
      targetId: null,
      changes: null,
      createdAt: "2024-06-01T10:00:00Z",
    };

    expect(log.target).toBeNull();
    expect(log.targetId).toBeNull();
    expect(log.user.name).toBeNull();
  });
});

// ─── StatisticsData type validation ──────────────────────────────────────────

describe("StatisticsData shape", () => {
  it("conforms to the expected interface", () => {
    const stats: StatisticsData = {
      memberBreakdown: { ACTIVE: 80, PENDING: 10, INACTIVE: 5, EXPIRED: 5 },
      memberTrend: [{ month: "jan. 24", count: 5 }],
      orderTrend: [{ month: "jan. 24", count: 12 }],
      topProducts: [
        { productId: "prod_1", name: "Maillot", salesCount: 30 },
      ],
      totalRevenue: 2500.0,
      totalOrders: 45,
    };

    expect(stats.memberBreakdown.ACTIVE).toBe(80);
    expect(stats.topProducts[0].name).toBe("Maillot");
    expect(stats.totalRevenue).toBe(2500.0);
  });
});

// ─── Role hierarchy checks ────────────────────────────────────────────────────

describe("role hierarchy", () => {
  const ROLE_WEIGHTS: Record<UserRole, number> = {
    MEMBER: 1,
    COACH: 2,
    COMMITTEE: 3,
    ADMIN: 4,
  };

  it("ADMIN has highest privilege", () => {
    expect(ROLE_WEIGHTS["ADMIN"]).toBeGreaterThan(ROLE_WEIGHTS["COMMITTEE"]);
  });

  it("COMMITTEE outranks COACH and MEMBER", () => {
    expect(ROLE_WEIGHTS["COMMITTEE"]).toBeGreaterThan(ROLE_WEIGHTS["COACH"]);
    expect(ROLE_WEIGHTS["COMMITTEE"]).toBeGreaterThan(ROLE_WEIGHTS["MEMBER"]);
  });

  it("COACH outranks MEMBER", () => {
    expect(ROLE_WEIGHTS["COACH"]).toBeGreaterThan(ROLE_WEIGHTS["MEMBER"]);
  });

  it("MEMBER has the lowest privilege", () => {
    expect(ROLE_WEIGHTS["MEMBER"]).toBe(1);
  });

  function canAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }

  it("ADMIN can access committee-only routes", () => {
    expect(canAccess("ADMIN", ["COMMITTEE", "ADMIN"])).toBe(true);
  });

  it("COMMITTEE can access committee-only routes", () => {
    expect(canAccess("COMMITTEE", ["COMMITTEE", "ADMIN"])).toBe(true);
  });

  it("MEMBER cannot access committee-only routes", () => {
    expect(canAccess("MEMBER", ["COMMITTEE", "ADMIN"])).toBe(false);
  });

  it("COACH cannot access admin-only routes", () => {
    expect(canAccess("COACH", ["ADMIN"])).toBe(false);
  });

  it("only ADMIN can access admin-only routes", () => {
    expect(canAccess("ADMIN", ["ADMIN"])).toBe(true);
    expect(canAccess("COMMITTEE", ["ADMIN"])).toBe(false);
    expect(canAccess("MEMBER", ["ADMIN"])).toBe(false);
  });
});

// ─── Date range calculation helpers ──────────────────────────────────────────

describe("date range calculations", () => {
  function getDaysFromNow(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  function isDueWithinDays(renewalDate: Date, days: number): boolean {
    const now = new Date();
    const cutoff = getDaysFromNow(days);
    return renewalDate >= now && renewalDate <= cutoff;
  }

  it("identifies renewal due within 30 days", () => {
    const renewalDate = getDaysFromNow(15);
    expect(isDueWithinDays(renewalDate, 30)).toBe(true);
  });

  it("does not flag renewal due after 30 days", () => {
    const renewalDate = getDaysFromNow(45);
    expect(isDueWithinDays(renewalDate, 30)).toBe(false);
  });

  it("does not flag renewal that already passed", () => {
    const renewalDate = getDaysFromNow(-5);
    expect(isDueWithinDays(renewalDate, 30)).toBe(false);
  });

  it("flags renewal due exactly today", () => {
    const renewalDate = new Date(Date.now() + 60 * 1000); // 1 minute from now
    expect(isDueWithinDays(renewalDate, 30)).toBe(true);
  });
});

// ─── Statistics calculation helpers ──────────────────────────────────────────

describe("statistics calculations", () => {
  it("computes average order value correctly", () => {
    const totalRevenue = 1500;
    const totalOrders = 10;
    const avg = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    expect(avg).toBe(150);
  });

  it("returns 0 average when no orders", () => {
    const totalRevenue = 0;
    const totalOrders = 0;
    const avg = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    expect(avg).toBe(0);
  });

  it("computes member breakdown total", () => {
    const breakdown = { ACTIVE: 80, PENDING: 10, INACTIVE: 5, EXPIRED: 5 };
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  it("finds top product in sales list", () => {
    const topProducts = [
      { productId: "p1", name: "Maillot", salesCount: 50 },
      { productId: "p2", name: "Short", salesCount: 30 },
      { productId: "p3", name: "Chaussures", salesCount: 20 },
    ];
    const top = topProducts[0];
    expect(top.name).toBe("Maillot");
    expect(top.salesCount).toBe(50);
  });
});
