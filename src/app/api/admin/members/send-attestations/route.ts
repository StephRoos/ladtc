import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { getCurrentSeason } from "@/lib/membership";
import { generateAttestationPdf } from "@/lib/attestation";
import { sendMembershipPaymentConfirmation } from "@/lib/email";
import { logActivity } from "@/lib/activity-log";

/**
 * POST /api/admin/members/send-attestations
 * Generates and sends the attestation PDF to all members who have paid
 * for the current season (status ACTIVE, season matches).
 *
 * Optional query param ?email=foo@bar.com to send to a single member only
 * (used for testing).
 *
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const currentSeason = getCurrentSeason();
  const { searchParams } = new URL(request.url);
  const filterEmail = searchParams.get("email");

  const members = await prisma.membership.findMany({
    where: {
      status: "ACTIVE",
      season: currentSeason,
      ...(filterEmail ? { user: { email: filterEmail } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, dateOfBirth: true } },
    },
  });

  if (members.length === 0) {
    return NextResponse.json({
      message: filterEmail
        ? `Aucun membre actif trouvé avec l'email ${filterEmail} pour la saison ${currentSeason}.`
        : `Aucun membre actif pour la saison ${currentSeason}.`,
      count: 0,
    });
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const m of members) {
    try {
      const name = m.user.name ?? m.user.email;
      const pdf = await generateAttestationPdf({
        memberName: name,
        season: currentSeason,
        amount: m.amount,
        paidAt: m.paidAt ?? new Date(),
      });

      await sendMembershipPaymentConfirmation(
        m.user.email,
        name,
        m.amount,
        currentSeason,
        pdf,
      );
      sent++;
    } catch (err) {
      failed++;
      errors.push(`${m.user.email}: ${err instanceof Error ? err.message : "Unknown error"}`);
      console.error(`[Send Attestations] Failed for ${m.user.email}:`, err);
    }
  }

  await logActivity(
    authResult.user.id,
    "attestations.send",
    "membership",
    undefined,
    { sent, failed, currentSeason, filterEmail },
  );

  return NextResponse.json({
    message: `${sent} attestation(s) envoyée(s)${failed > 0 ? `, ${failed} échec(s)` : ""}.`,
    count: sent,
    failed,
    ...(errors.length > 0 ? { errors } : {}),
  });
}
