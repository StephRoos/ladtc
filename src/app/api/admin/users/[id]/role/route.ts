import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleUpdateSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";

/**
 * PATCH /api/admin/users/[id]/role
 * Update a user's role. Restricted to ADMIN only.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé — rôle ADMIN requis" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = roleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  const { role, committeeRole } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Clear committeeRole when the user is no longer COMMITTEE
  const resolvedCommitteeRole = role === "COMMITTEE" ? (committeeRole ?? null) : null;

  const updated = await prisma.user.update({
    where: { id },
    data: { role, committeeRole: resolvedCommitteeRole },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      committeeRole: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logActivity(session.user.id, "USER_ROLE_UPDATED", "user", id, {
    previousRole: target.role,
    newRole: role,
    previousCommitteeRole: target.committeeRole,
    newCommitteeRole: resolvedCommitteeRole,
  });

  return NextResponse.json({ user: updated });
}
