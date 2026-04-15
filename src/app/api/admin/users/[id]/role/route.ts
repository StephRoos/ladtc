import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { roleUpdateSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { sendEmail } from "@/lib/email";
import { roleUpdateTemplate } from "@/lib/email-templates";

/**
 * PATCH /api/admin/users/[id]/role
 * Update a user's role. Restricted to ADMIN only.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireAdmin(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = roleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Rôle invalide";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { role, committeeRole } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Normalize: empty/whitespace committeeRole → null, clear when not COMMITTEE
  const resolvedCommitteeRole =
    role === "COMMITTEE" && committeeRole ? committeeRole : null;

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

  await logActivity(authResult.user.id, "USER_ROLE_UPDATED", "user", id, {
    previousRole: target.role,
    newRole: role,
    previousCommitteeRole: target.committeeRole,
    newCommitteeRole: resolvedCommitteeRole,
  });

  const roleChanged =
    target.role !== role || target.committeeRole !== resolvedCommitteeRole;
  if (roleChanged) {
    const name = updated.name ?? updated.email;
    sendEmail(
      updated.email,
      "Votre rôle a été mis à jour — la dtc",
      roleUpdateTemplate(name, role, resolvedCommitteeRole),
    ).catch((err) => {
      console.error("[role update] email send failed:", err);
    });
  }

  return NextResponse.json({ user: updated });
}
