/**
 * Create test accounts for each role via BetterAuth signup API.
 * Run with: pnpm exec tsx scripts/seed-test-accounts.ts
 * Requires the dev server to be running on localhost:3000.
 */

const BASE_URL = "http://localhost:3000";

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
  { name: "Pierre Coach", email: "coach@test.com", password: "Coach2026!", role: "COACH" },
  { name: "Jean Membre", email: "membre@test.com", password: "Membre2026!", role: "MEMBER" },
];

async function createAccount(account: TestAccount): Promise<void> {
  // 1. Register via BetterAuth
  const signupRes = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: account.name,
      email: account.email,
      password: account.password,
    }),
  });

  if (!signupRes.ok) {
    const text = await signupRes.text();
    if (text.includes("already") || text.includes("exists") || text.includes("UNIQUE")) {
      console.log(`  ⏭  ${account.email} — already exists`);
    } else {
      console.error(`  ✗  ${account.email} — signup failed: ${text}`);
      return;
    }
  } else {
    console.log(`  ✓  ${account.email} — account created`);
  }

  // 2. Update role directly in DB via API is not possible, use prisma
  // We'll do this in a second pass after all accounts are created
}

async function updateRoles(): Promise<void> {
  // Use Prisma directly to set roles
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../src/generated/prisma/client");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const account of accounts) {
    try {
      const user = await prisma.user.update({
        where: { email: account.email },
        data: { role: account.role, emailVerified: true },
      });
      console.log(`  ✓  ${account.email} → role=${user.role}`);
    } catch {
      console.log(`  ⏭  ${account.email} — user not found, skipping role update`);
    }
  }

  // Create memberships for all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
    where: { email: { in: accounts.map((a) => a.email) } },
  });

  for (const user of users) {
    const existing = await prisma.membership.findUnique({ where: { userId: user.id } });
    if (!existing) {
      await prisma.membership.create({
        data: {
          userId: user.id,
          status: user.email === "membre@test.com" ? "PENDING" : "ACTIVE",
          amount: 50,
          renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          paidAt: user.email === "membre@test.com" ? null : new Date(),
        },
      });
      console.log(`  ✓  ${user.email} → membership created`);
    } else {
      console.log(`  ⏭  ${user.email} → membership exists`);
    }
  }

  await prisma.$disconnect();
}

async function main(): Promise<void> {
  console.log("\n🏃 Creating test accounts...\n");

  // Step 1: Create accounts via BetterAuth API
  for (const account of accounts) {
    await createAccount(account);
  }

  console.log("\n🔑 Setting roles and memberships...\n");

  // Step 2: Update roles via Prisma
  await updateRoles();

  console.log("\n✅ Done! Test accounts ready:\n");
  console.log("┌────────────────────┬──────────────────┬───────────────┬───────────┐");
  console.log("│ Nom                │ Email            │ Mot de passe  │ Role      │");
  console.log("├────────────────────┼──────────────────┼───────────────┼───────────┤");
  for (const a of accounts) {
    console.log(
      `│ ${a.name.padEnd(18)} │ ${a.email.padEnd(16)} │ ${a.password.padEnd(13)} │ ${a.role.padEnd(9)} │`
    );
  }
  console.log("└────────────────────┴──────────────────┴───────────────┴───────────┘");
  console.log("\nLogin: http://localhost:3000/auth/login\n");
}

main().catch(console.error);
