"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

type AuthUser = { id: string; name: string; email: string; role?: string };

/**
 * Hook to access current auth state.
 * Wraps BetterAuth's useSession with a simpler API.
 */
export function useAuth(): {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const { data: session, isPending } = useSession();

  return {
    user: (session?.user as AuthUser) ?? null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  };
}

/**
 * Hook that redirects to login if the user is not authenticated.
 */
export function useRequireAuth(redirectTo: string = "/auth/login"): {
  user: AuthUser | null;
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
