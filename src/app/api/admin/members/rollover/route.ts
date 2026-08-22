import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { getCurrentSeason } from "@/lib/membership";
import { MEMBERSHIP_DUES_NET } from "@/lib/membership-fees";
import { logActivity } from "@/lib/activity-log";

/**
 * POST /api/admin/members/rollover
 * One-time season rollover: expires all ACTIVE memberships whose season does
 * not match the current season, and updates their amount to the current dues.
 * This lets members see "Non payée" and pay for the new season online.
 * Restricted to COMMITTEE and ADMIN roles.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const currentSeason = getCurrentSeason();

  const stale = await prisma.membership.findMany({
    where: {
      status: "ACTIVE",
      season: { not: currentSeason },
    },
    select: { id: true, userId: true, season: true, amount: true },
  });

  if (stale.length === 0) {
    return NextResponse.json({
      message: "Aucun membre à expirer — tous les membres actifs sont déjà sur la saison courante.",
      count: 0,
      currentSeason,
    });
  }

  const result = await prisma.membership.updateMany({
    where: {
      status: "ACTIVE",
      season: { not: currentSeason },
    },
    data: {
      status: "EXPIRED",
      amount: MEMBERSHIP_DUES_NET,
    },
  });

  await logActivity(
    authResult.user.id,
    "season.rollover",
    "membership",
    undefined,
    {
      count: result.count,
      fromStatus: "ACTIVE",
      toStatus: "EXPIRED",
      amount: MEMBERSHIP_DUES_NET,
      currentSeason,
    },
  );

  return NextResponse.json({
    message: `${result.count} membre(s) expiré(s) pour la saison ${currentSeason}.`,
    count: result.count,
    currentSeason,
    newAmount: MEMBERSHIP_DUES_NET,
  });
}
