import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock BetterAuth before importing auth-guard
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import {
  requireAuth,
  requireRole,
  requireAdmin,
  requireCommittee,
  isAuthError,
  COMMITTEE_ROLES,
  TRAINING_ROLES,
} from "@/lib/auth-guard";
import type { UserRole } from "@/types";

const mockGetSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;

function makeRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/test");
}

function mockSession(role: UserRole, overrides?: Record<string, unknown>) {
  return {
    user: {
      id: "user-1",
      email: "test@ladtc.be",
      name: "Test User",
      image: null,
      role,
      committeeRole: null,
      ...overrides,
    },
    session: { id: "session-1", token: "tok" },
  };
}

beforeEach(() => {
  mockGetSession.mockReset();
});

// ─── requireAuth ───────────────────────────────────────────────────

describe("requireAuth", () => {
  it("returns AuthSession when user is authenticated", async () => {
    mockGetSession.mockResolvedValue(mockSession("MEMBER"));
    const result = await requireAuth(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    if (!(result instanceof NextResponse)) {
      expect(result.user.id).toBe("user-1");
      expect(result.user.role).toBe("MEMBER");
    }
  });

  it("returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await requireAuth(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(401);
      const body = await result.json();
      expect(body.error).toBe("Non autorisé");
    }
  });

  it("returns 401 when session has no user", async () => {
    mockGetSession.mockResolvedValue({ session: {}, user: null });
    const result = await requireAuth(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(401);
    }
  });
});

// ─── requireRole ───────────────────────────────────────────────────

describe("requireRole", () => {
  it("returns AuthSession when user has an allowed role", async () => {
    mockGetSession.mockResolvedValue(mockSession("ADMIN"));
    const result = await requireRole(makeRequest(), ["COMMITTEE", "ADMIN"]);

    expect(result).not.toBeInstanceOf(NextResponse);
    if (!(result instanceof NextResponse)) {
      expect(result.user.role).toBe("ADMIN");
    }
  });

  it("returns 403 when user role is not allowed", async () => {
    mockGetSession.mockResolvedValue(mockSession("MEMBER"));
    const result = await requireRole(makeRequest(), ["COMMITTEE", "ADMIN"]);

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(403);
      const body = await result.json();
      expect(body.error).toBe("Accès refusé");
    }
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await requireRole(makeRequest(), ["ADMIN"]);

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(401);
    }
  });

  it("accepts COACH role when included in allowed roles", async () => {
    mockGetSession.mockResolvedValue(mockSession("COACH"));
    const result = await requireRole(makeRequest(), TRAINING_ROLES);

    expect(result).not.toBeInstanceOf(NextResponse);
    if (!(result instanceof NextResponse)) {
      expect(result.user.role).toBe("COACH");
    }
  });

  it("rejects COACH when only COMMITTEE+ADMIN allowed", async () => {
    mockGetSession.mockResolvedValue(mockSession("COACH"));
    const result = await requireRole(makeRequest(), COMMITTEE_ROLES);

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(403);
    }
  });
});

// ─── requireAdmin ──────────────────────────────────────────────────

describe("requireAdmin", () => {
  it("returns AuthSession for ADMIN role", async () => {
    mockGetSession.mockResolvedValue(mockSession("ADMIN"));
    const result = await requireAdmin(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    if (!(result instanceof NextResponse)) {
      expect(result.user.role).toBe("ADMIN");
    }
  });

  it("returns 403 for COMMITTEE role (not ADMIN)", async () => {
    mockGetSession.mockResolvedValue(mockSession("COMMITTEE"));
    const result = await requireAdmin(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(403);
      const body = await result.json();
      expect(body.error).toBe("Accès refusé — rôle ADMIN requis");
    }
  });

  it("returns 403 for MEMBER role", async () => {
    mockGetSession.mockResolvedValue(mockSession("MEMBER"));
    const result = await requireAdmin(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(403);
    }
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await requireAdmin(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(401);
    }
  });
});

// ─── requireCommittee ──────────────────────────────────────────────

describe("requireCommittee", () => {
  it("returns AuthSession for COMMITTEE role", async () => {
    mockGetSession.mockResolvedValue(mockSession("COMMITTEE"));
    const result = await requireCommittee(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    if (!(result instanceof NextResponse)) {
      expect(result.user.role).toBe("COMMITTEE");
    }
  });

  it("returns AuthSession for ADMIN role", async () => {
    mockGetSession.mockResolvedValue(mockSession("ADMIN"));
    const result = await requireCommittee(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
  });

  it("returns 403 for MEMBER role", async () => {
    mockGetSession.mockResolvedValue(mockSession("MEMBER"));
    const result = await requireCommittee(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(403);
    }
  });

  it("returns 403 for COACH role", async () => {
    mockGetSession.mockResolvedValue(mockSession("COACH"));
    const result = await requireCommittee(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(403);
    }
  });
});

// ─── isAuthError ───────────────────────────────────────────────────

describe("isAuthError", () => {
  it("returns true for NextResponse", () => {
    const response = NextResponse.json({ error: "test" }, { status: 401 });
    expect(isAuthError(response)).toBe(true);
  });

  it("returns false for AuthSession", () => {
    const session = {
      user: {
        id: "1",
        email: "a@b.com",
        name: null,
        image: null,
        role: "MEMBER" as UserRole,
        committeeRole: null,
      },
      session: {},
    };
    expect(isAuthError(session)).toBe(false);
  });
});

// ─── Role constants ────────────────────────────────────────────────

describe("role constants", () => {
  it("COMMITTEE_ROLES includes COMMITTEE and ADMIN", () => {
    expect(COMMITTEE_ROLES).toContain("COMMITTEE");
    expect(COMMITTEE_ROLES).toContain("ADMIN");
    expect(COMMITTEE_ROLES).not.toContain("MEMBER");
    expect(COMMITTEE_ROLES).not.toContain("COACH");
  });

  it("TRAINING_ROLES includes COACH, COMMITTEE, and ADMIN", () => {
    expect(TRAINING_ROLES).toContain("COACH");
    expect(TRAINING_ROLES).toContain("COMMITTEE");
    expect(TRAINING_ROLES).toContain("ADMIN");
    expect(TRAINING_ROLES).not.toContain("MEMBER");
  });
});
