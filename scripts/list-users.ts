import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { membership: true, accounts: { select: { providerId: true } } },
  });

  console.log("Total users:", users.length);
  for (const u of users) {
    console.log(
      [
        u.createdAt.toISOString().slice(0, 19),
        u.email,
        u.role,
        u.emailVerified ? "✓" : "✗",
        u.membership?.status ?? "no-membership",
        u.accounts.map((a) => a.providerId).join(","),
        u.name,
      ].join(" | "),
    );
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
