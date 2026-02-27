import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { memberCreateSchema } from "@/lib/schemas";
import { sendWelcomeEmail } from "@/lib/email";

const ADMIN_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * POST /api/admin/members
 * Creates a new user via BetterAuth and their membership via Prisma.
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ADMIN_ROLES.includes(userRole as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

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

  const { name, email, status, renewalDate, paidAt, amount, notes } = parsed.data;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email" },
      { status: 409 }
    );
  }

  try {
    // Create user via BetterAuth (handles password hashing + account record)
    const temporaryPassword = crypto.randomUUID();
    const signUpResult = await auth.api.signUpEmail({
      body: { name, email, password: temporaryPassword },
    });

    if (!signUpResult?.user?.id) {
      return NextResponse.json(
        { error: "Erreur lors de la création du compte" },
        { status: 500 }
      );
    }

    const userId = signUpResult.user.id;

    // Create the membership
    const membership = await prisma.membership.create({
      data: {
        userId,
        status,
        renewalDate: new Date(renewalDate),
        paidAt: paidAt ? new Date(paidAt) : null,
        amount,
        notes: notes ?? null,
      },
    });

    // Fetch the full user record
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ name, email }).catch((err) => {
      console.error("[CreateMember] Failed to send welcome email:", err);
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
