import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { memberUpdateSchema } from "@/lib/schemas";

/**
 * GET /api/members/[id]
 * Returns a specific member's profile and membership.
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { membership: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }

  return NextResponse.json({ user, membership: user.membership });
}

/**
 * PATCH /api/members/[id]
 * Updates a member's membership status, renewal date, paid date, amount, and notes.
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = memberUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { status, season, paidAt, amount, notes, joinedYear, name } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { membership: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }

  // Update the user's name if provided. Lets the committee fix inverted or
  // malformed names (e.g. "Carton-Delcourt Bruno" → "Bruno Carton-Delcourt")
  // without asking the member to do it themselves.
  if (name !== undefined && name !== user.name) {
    await prisma.user.update({ where: { id }, data: { name } });
  }
  // Re-fetch so the response reflects the updated name (kept separate from
  // the membership upsert below which only returns the membership).
  const updatedUser = await prisma.user.findUnique({
    where: { id },
    include: { membership: true },
  });

  // Normalize the optional joinedYear (e.g. 2023) to a joinedAt Date set to
  // January 1 of that year. The profile only displays the year, so the exact
  // day is irrelevant. When joinedYear is not provided, leave joinedAt
  // unchanged (preserve the existing value on partial updates).
  const joinedAtUpdate =
    joinedYear !== undefined ? new Date(joinedYear, 0, 1) : undefined;

  const membership = await prisma.membership.upsert({
    where: { userId: id },
    create: {
      userId: id,
      status,
      season: season ?? null,
      paidAt: paidAt ? new Date(paidAt) : null,
      amount,
      notes: notes ?? null,
      joinedAt: joinedAtUpdate ?? new Date(),
    },
    update: {
      status,
      season: season ?? null,
      paidAt: paidAt ? new Date(paidAt) : null,
      amount,
      notes: notes ?? null,
      ...(joinedAtUpdate !== undefined ? { joinedAt: joinedAtUpdate } : {}),
    },
  });

  return NextResponse.json({ user: updatedUser ?? user, membership });
}
