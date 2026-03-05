import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/schemas";

/**
 * GET /api/members/me
 * Returns the current authenticated user's profile and membership data.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const user = await prisma.user.findUnique({
    where: { id: authResult.user.id },
    include: { membership: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json({ user, membership: user.membership });
}

/**
 * PATCH /api/members/me
 * Updates the current authenticated user's profile fields.
 * Members can update: name, phone, emergencyContact, emergencyContactPhone.
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, phone, emergencyContact, emergencyContactPhone } = parsed.data;

  // Update user name if provided
  const updatedUser = await prisma.user.update({
    where: { id: authResult.user.id },
    data: { ...(name !== undefined && { name }) },
    include: { membership: true },
  });

  // Update membership contact fields if membership exists
  if (updatedUser.membership && (phone !== undefined || emergencyContact !== undefined || emergencyContactPhone !== undefined)) {
    await prisma.membership.update({
      where: { userId: authResult.user.id },
      data: {
        ...(phone !== undefined && { phone }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
      },
    });
  }

  // Re-fetch with updated data
  const finalUser = await prisma.user.findUnique({
    where: { id: authResult.user.id },
    include: { membership: true },
  });

  return NextResponse.json({ user: finalUser, membership: finalUser?.membership });
}
