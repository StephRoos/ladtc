/**
 * One-time season rollover script.
 *
 * Marks all memberships that are ACTIVE for a past season as EXPIRED, so
 * members see "Cotisation non payée" and can pay for the new season.
 * Also updates the amount to the current dues (MEMBERSHIP_DUES_NET) so
 * the Stripe checkout charges the correct fee on renewal.
 *
 * Only touches memberships whose season does NOT match the current season.
 * INACTIVE members are left untouched.
 *
 * Run with: pnpm rollover
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getCurrentSeason } from "../src/lib/membership";
import { MEMBERSHIP_DUES_NET } from "../src/lib/membership-fees";

async function main(): Promise<void> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const currentSeason = getCurrentSeason();
  console.log(`\nSeason rollover — current season: ${currentSeason}\n`);

  // Find all ACTIVE memberships whose season is NOT the current one
  const stale = await prisma.membership.findMany({
    where: {
      status: "ACTIVE",
      season: { not: currentSeason },
    },
    include: { user: { select: { email: true, name: true } } },
  });

  console.log(`Found ${stale.length} membership(s) to expire.\n`);

  if (stale.length === 0) {
    console.log("Nothing to do. All active members are already on the current season.");
    await prisma.$disconnect();
    return;
  }

  for (const m of stale) {
    console.log(
      `  ${m.user.email} — ${m.season ?? "null"} → EXPIRED, amount ${m.amount} → ${MEMBERSHIP_DUES_NET}`,
    );
  }

  console.log("\nUpdating...\n");

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

  console.log(`Done. ${result.count} membership(s) set to EXPIRED.\n`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
