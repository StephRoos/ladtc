"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

/**
 * Hook to access current auth state
 * Wraps BetterAuth's useSession with a simpler API
 *
 * @returns Auth state with user, loading state, and authentication status
 */
export function useAuth(): {
  user: NonNullable<ReturnType<typeof useSession>["data"]>["user"] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const { data: session, isPending } = useSession();

  return {
    user: session?.user ?? null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  };
}

/**
 * Hook that redirects to login if the user is not authenticated.
 * Use in client components that require authentication.
 *
 * @param redirectTo - Path to redirect unauthenticated users to (default: /auth/login)
 * @returns Auth state
 */
export function useRequireAuth(redirectTo: string = "/auth/login"): {
  user: NonNullable<ReturnType<typeof useSession>["data"]>["user"] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push(redirectTo);
    }
  }, [auth.isLoading, auth.isAuthenticated, router, redirectTo]);

  return auth;
}
