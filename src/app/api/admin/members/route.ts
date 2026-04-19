import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { memberCreateSchema } from "@/lib/schemas";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";

/**
 * POST /api/admin/members
 * Creates a new user directly via Prisma (email pre-verified because admin vouches
 * for the address), then triggers a password reset so the user can define their
 * own password. Only one email is sent — the reset link acts as both the welcome
 * and the verification. Restricted to COMMITTEE and ADMIN roles.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = memberCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, email, status, season, paidAt, amount, notes } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email" },
      { status: 409 }
    );
  }

  try {
    // Create user + credential account directly (bypass signUpEmail to avoid the
    // automatic verification email — admin-created accounts are pre-verified).
    const user = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: true,
        accounts: {
          create: {
            accountId: email,
            providerId: "credential",
            password: null,
          },
        },
      },
    });

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        status,
        season: season ?? null,
        paidAt: paidAt ? new Date(paidAt) : null,
        amount,
        notes: notes ?? null,
      },
    });

    // Trigger password reset so the new user can define their own password
    auth.api
      .requestPasswordReset({
        body: {
          email,
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/new-password`,
        },
      })
      .catch((err: unknown) => {
        console.error("[CreateMember] Failed to send password reset:", err);
      });

    return NextResponse.json({ user, membership }, { status: 201 });
  } catch (err) {
    console.error("Failed to create member:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du membre" },
      { status: 500 }
    );
  }
}
