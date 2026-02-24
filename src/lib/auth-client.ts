"use client";

import { createAuthClient } from "better-auth/react";

/**
 * BetterAuth client for use in React components
 * Provides hooks and methods for authentication
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { useSession, signIn, signUp, signOut } = authClient;
