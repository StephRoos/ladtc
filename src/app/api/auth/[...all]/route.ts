import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * BetterAuth catch-all route handler
 * Handles all /api/auth/* endpoints (login, register, session, etc.)
 */
export const { GET, POST } = toNextJsHandler(auth);
