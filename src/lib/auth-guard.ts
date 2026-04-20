import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/types";

/**
 * Typed session returned by auth guards.
 * The `role` field is properly typed as UserRole instead of requiring unsafe casts.
 */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: UserRole;
    committeeRole: string | null;
    [key: string]: unknown;
  };
  session: Record<string, unknown>;
}

/** Roles allowed to access admin features (events, members, blog, etc.) */
export const COMMITTEE_ROLES: UserRole[] = ["COMMITTEE", "ADMIN"];

/**
 * Require an authenticated session. Returns AuthSession or a 401 NextResponse.
 * @param request - The incoming request
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthSession | NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = session.user as unknown as AuthSession["user"];
  return { user, session: session.session as unknown as Record<string, unknown> };
}

/**
 * Require an authenticated session with one of the allowed roles.
 * Returns AuthSession or a 401/403 NextResponse.
 * @param request - The incoming request
 * @param allowedRoles - Array of roles that are permitted
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthSession | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (!allowedRoles.includes(result.user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  return result;
}

/**
 * Require ADMIN role. Returns AuthSession or a 401/403 NextResponse.
 * @param request - The incoming request
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AuthSession | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (result.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Accès refusé — rôle ADMIN requis" },
      { status: 403 }
    );
  }

  return result;
}

/**
 * Require COMMITTEE or ADMIN role. Returns AuthSession or a 401/403 NextResponse.
 * @param request - The incoming request
 */
export async function requireCommittee(
  request: NextRequest
): Promise<AuthSession | NextResponse> {
  return requireRole(request, COMMITTEE_ROLES);
}

/**
 * Type guard: checks if a guard result is an error response.
 * Useful for early returns: `if (isAuthError(result)) return result;`
 */
export function isAuthError(
  result: AuthSession | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
