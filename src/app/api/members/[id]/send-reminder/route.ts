import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRenewalReminder } from "@/lib/email";
import type { MemberWithMembership } from "@/types";

const ALLOWED_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * POST /api/members/[id]/send-reminder
 * Sends a renewal reminder email to a specific member.
 * Restricted to COMMITTEE and ADMIN roles.
 * Email is stubbed with console.log until SMTP is configured.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ALLOWED_ROLES.includes(userRole as (typeof ALLOWED_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { membership: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }

  if (!user.membership) {
    return NextResponse.json(
      { error: "Ce membre n'a pas de cotisation enregistrée" },
      { status: 422 }
    );
  }

  sendRenewalReminder(user as unknown as MemberWithMembership);

  return NextResponse.json({
    success: true,
    message: `Rappel envoyé à ${user.email}`,
  });
}
