/**
 * Create test accounts for each role directly via Prisma + BetterAuth's
 * password hasher. Does NOT go through the HTTP signup API — avoids the
 * trustedOrigins check.
 *
 * Run with: pnpm seed:test (which loads .env.local via node --env-file)
 */

import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCurrentSeason } from "../src/lib/membership";
import { PrismaClient } from "../src/generated/prisma/client";
import type { UserRole } from "../src/generated/prisma/client";

interface TestAccount {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const accounts: TestAccount[] = [
  { name: "Admin LADTC", email: "admin@ladtc.be", password: "Admin2026!", role: "ADMIN" },
  { name: "Marie Comité", email: "comite@test.com", password: "Comite2026!", role: "COMMITTEE" },
  { name: "Jean Membre", email: "membre@test.com", password: "Membre2026!", role: "MEMBER" },
];

async function main(): Promise<void> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  console.log("\n🧹 Cleaning existing test accounts...\n");
  const emails = accounts.map((a) => a.email);
  const deleted = await prisma.user.deleteMany({ where: { email: { in: emails } } });
  console.log(`  Deleted ${deleted.count} existing test user(s)\n`);

  console.log("🏃 Creating fresh test accounts...\n");
  for (const account of accounts) {
    const hashed = await hashPassword(account.password);
    const user = await prisma.user.create({
      data: {
        name: account.name,
        email: account.email,
        emailVerified: true,
        role: account.role,
        accounts: {
          create: {
            accountId: account.email,
            providerId: "credential",
            password: hashed,
          },
        },
        membership:
          account.email === "membre@test.com"
            ? undefined
            : {
                create: {
                  status: "ACTIVE",
                  amount: 50,
                  season: getCurrentSeason(),
                  paidAt: new Date(),
                },
              },
      },
    });
    console.log(`  ✓  ${user.email} → ${user.role}`);
  }

  // Membership for member with PENDING status
  const member = await prisma.user.findUnique({ where: { email: "membre@test.com" } });
  if (member) {
    await prisma.membership.upsert({
      where: { userId: member.id },
      update: {},
      create: {
        userId: member.id,
        status: "PENDING",
        amount: 50,
        season: null,
        paidAt: null,
      },
    });
    console.log(`  ✓  membre@test.com → membership PENDING`);
  }

  await prisma.$disconnect();

  console.log("\n✅ Done! Test accounts ready:\n");
  console.log("┌────────────────────┬──────────────────┬───────────────┬───────────┐");
  console.log("│ Nom                │ Email            │ Mot de passe  │ Role      │");
  console.log("├────────────────────┼──────────────────┼───────────────┼───────────┤");
  for (const a of accounts) {
    console.log(
      `│ ${a.name.padEnd(18)} │ ${a.email.padEnd(16)} │ ${a.password.padEnd(13)} │ ${a.role.padEnd(9)} │`,
    );
  }
  console.log("└────────────────────┴──────────────────┴───────────────┴───────────┘");
  console.log("\nLogin: http://localhost:3000/auth/login\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
