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

  const { name, dateOfBirth, phone, emergencyContact, emergencyContactPhone } = parsed.data;

  // Update user fields if provided (name, dateOfBirth)
  if (name !== undefined || dateOfBirth !== undefined) {
    await prisma.user.update({
      where: { id: authResult.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
      },
    });
  }

  // Upsert membership contact fields when any contact field is provided
  if (phone !== undefined || emergencyContact !== undefined || emergencyContactPhone !== undefined) {
    await prisma.membership.upsert({
      where: { userId: authResult.user.id },
      create: {
        userId: authResult.user.id,
        season: null, // Season set when membership is paid
        ...(phone !== undefined && { phone }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
      },
      update: {
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
