import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { sendRenewalReminder } from "@/lib/email";
import type { MemberWithMembership } from "@/types";

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
