import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Routes that require authentication to access
 */
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/admin", "/orders"];

/**
 * Proxy (formerly middleware) to protect routes requiring authentication.
 * Checks for a session cookie and redirects to login if missing.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check for BetterAuth session cookie
  const sessionCookie =
    request.cookies.get("ladtc.session_token") ??
    request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
