# Spec 03: Authentication Setup — BetterAuth + Email Verification

**Phase**: MVP
**Priority**: 3
**Estimated Time**: 10 hours
**Dependencies**: Spec 04 (Member Management) depends on this

## Feature

Set up BetterAuth for email-based user registration, login, password reset, and session management. Implement role-based access control (member, committee, admin).

## Goals

- Users can register with email and password
- Email verification before account activation
- Users can log in and stay logged in (persistent sessions)
- Users can reset forgotten password via email
- Role-based access control (RBAC) for protecting routes
- Secure session management (HTTP-only cookies)

## User Stories

1. **As a visitor**, I want to register with an email and password so I can join the club.
2. **As a new member**, I want to verify my email before my account is active.
3. **As a member**, I want to stay logged in when I close my browser.
4. **As a member**, I want to reset my password if I forget it.
5. **As an admin**, I want to assign roles to members so they can access appropriate features.
6. **As a committee member**, I want to log in and access the admin dashboard.

## Acceptance Criteria

- [ ] BetterAuth installed and configured with email strategy
- [ ] Database: `users` table created via Prisma migration
- [ ] User registration endpoint: `POST /api/auth/register`
- [ ] Email verification flow implemented (verification link in email)
- [ ] User login endpoint: `POST /api/auth/login`
- [ ] Password reset endpoint: `POST /api/auth/reset-password`
- [ ] Session stored in HTTP-only cookie (secure, SameSite=Strict)
- [ ] Session persists across browser restarts (30-day expiry)
- [ ] Role-based middleware for protecting routes
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Admin routes require ADMIN role
- [ ] Committee routes require COMMITTEE or ADMIN role
- [ ] Member routes require MEMBER role or higher
- [ ] Tests: Auth flow, role checks, session management

## Technical Details

### BetterAuth Configuration

BetterAuth is a lightweight auth library with email support.

```typescript
// src/lib/auth.ts (configuration, not yet created)

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma"; // From Prisma setup (Spec 04)

export const auth = betterAuth({
  database: prismaAdapter(prisma),
  emailAndPassword: {
    enabled: true,
    autoSignUpEmailVerified: false,
    sendResetEmail: true,
  },
  secondaryStorage: {
    getItem: (key) => {
      // Optional: use Redis for session storage
    },
    setItem: (key, value) => {},
    removeItem: (key) => {},
  },
  rateLimit: {
    enabled: true,
    max: 5, // max 5 requests
    window: 60 * 1000, // per minute
  },
});
```

### Database Schema

```prisma
// prisma/schema.prisma (to be created)

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String    // Hashed by BetterAuth
  role          UserRole  @default(MEMBER)
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  membership    Membership?
  orders        Order[]
  sessions      Session[]
}

enum UserRole {
  MEMBER
  COACH
  COMMITTEE
  ADMIN
}

model Session {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String    @unique
  expiresAt DateTime
  createdAt DateTime  @default(now())
}

model EmailVerification {
  id        String    @id @default(cuid())
  email     String    @unique
  token     String    @unique
  expiresAt DateTime
  createdAt DateTime  @default(now())
}
```

### API Endpoints

```
POST /api/auth/register
  Body: { email, password, name? }
  Response: { user: User, message: "Verification email sent" }

POST /api/auth/login
  Body: { email, password }
  Response: { user: User, token: string }

POST /api/auth/logout
  Response: { success: boolean }

POST /api/auth/verify-email
  Body: { token }
  Response: { success: boolean, message: string }

POST /api/auth/reset-password
  Body: { email }
  Response: { message: "Reset email sent" }

POST /api/auth/reset-password-confirm
  Body: { token, password }
  Response: { success: boolean }

GET /api/auth/session
  Response: { user: User | null }
```

### Middleware for Route Protection

```typescript
// src/lib/middleware.ts (to be created)

import { NextRequest, NextResponse } from "next/server";

export async function withAuth(
  request: NextRequest,
  handler: (user: User) => Promise<NextResponse>
) {
  const session = request.cookies.get("session");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate session and get user
  const user = await getSessionUser(session.value);
  if (!user) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  return handler(user);
}

export async function withRole(
  request: NextRequest,
  requiredRoles: UserRole[],
  handler: (user: User) => Promise<NextResponse>
) {
  const user = await getSessionUser(getCookie(request, "session"));
  if (!user || !requiredRoles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return handler(user);
}
```

### Frontend Hooks

```typescript
// src/hooks/useAuth.ts (to be created)

import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return null;
      return res.json();
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    },
  });
}

// Similar hooks for register, logout, reset password
```

### Protected Route Example

```typescript
// src/app/(member)/dashboard/page.tsx

"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function MemberDashboard() {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      {/* Member dashboard content */}
    </div>
  );
}
```

### Middleware for App Router

```typescript
// src/middleware.ts (to be created)

import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/orders", "/admin"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");

  // Redirect to login if accessing protected route without session
  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|public).*)"],
};
```

## Implementation Files

1. **`src/lib/auth.ts`** — BetterAuth configuration
2. **`src/lib/middleware.ts`** — Route protection helpers
3. **`src/hooks/useAuth.ts`** — Custom hooks for auth
4. **`src/hooks/useSession.ts`** — Session management
5. **`src/app/(auth)/login/page.tsx`** (new) — Login page
6. **`src/app/(auth)/register/page.tsx`** (new) — Registration page
7. **`src/app/(auth)/reset-password/page.tsx`** (new) — Password reset page
8. **`src/components/forms/LoginForm.tsx`** (new) — Login form
9. **`src/components/forms/RegisterForm.tsx`** (new) — Registration form
10. **`src/app/api/auth/[...all].ts`** (new) — BetterAuth catch-all route
11. **`src/middleware.ts`** (new) — Next.js middleware
12. **`prisma/schema.prisma`** — Database schema (update from Spec 04)
13. **Tests**: `__tests__/auth.test.ts`, `__tests__/LoginForm.test.tsx`

## Validation Schemas (Zod)

```typescript
// src/lib/schemas.ts (to be created)

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});
```

## Email Templates

### Verification Email

```
Subject: Verify your LADTC account

Hello {name},

Thank you for registering with LADTC. Please verify your email by clicking the link below:

[Verification Link: https://ladtc.be/auth/verify-email?token={token}]

This link expires in 24 hours.

If you didn't sign up for this account, you can safely ignore this email.

Best regards,
LADTC Team
```

### Password Reset Email

```
Subject: Reset your LADTC password

Hello,

You requested a password reset. Click the link below to set a new password:

[Reset Link: https://ladtc.be/auth/reset-password?token={token}]

This link expires in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
LADTC Team
```

## Testing

### Unit Tests
- Password hashing/validation
- Email validation
- Role checking functions
- Token generation and validation

### Integration Tests
- Registration flow (success and error cases)
- Email verification flow
- Login/logout flow
- Password reset flow
- Protected route access (with and without auth)
- Role-based access control

### Manual Testing
- Register new account
- Check email for verification link
- Click verification link
- Login with verified account
- Logout
- Try to access protected route (redirects to login)
- Reset password flow
- Admin assigns role to user

## Dependencies

- BetterAuth library (not yet installed)
- PostgreSQL database (Spec 04: Member Management)
- Prisma ORM (Spec 04: Member Management)
- Email service (SMTP, see .env.example)

## Blockers

- PostgreSQL database must be set up first (Spec 04)
- SMTP credentials required for email sending
- BetterAuth must be installed: `pnpm add better-auth prisma-adapter`

## Notes

- BetterAuth handles password hashing securely (bcrypt)
- Sessions expire after 30 days of inactivity
- Email verification prevents spam registrations
- Rate limiting on auth endpoints prevents brute force attacks
- Consider adding 2FA in post-MVP phase
- OAuth (Google, GitHub) integration can be added later

## Security Considerations

- NEVER expose session tokens in URLs
- Always use HTTPS in production
- Set `Secure` and `SameSite=Strict` on session cookies
- Rate limit login attempts
- Hash passwords with salt (BetterAuth handles)
- Validate email ownership before activating account
