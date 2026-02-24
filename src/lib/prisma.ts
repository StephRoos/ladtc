import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/**
 * Get or create the Prisma client instance.
 * Uses a global singleton in development to prevent hot-reload connection leaks.
 *
 * @throws Error if DATABASE_URL is not configured
 */
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Please configure your database connection."
    );
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const client = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

/**
 * Prisma client singleton — only created when first accessed.
 * Will throw if DATABASE_URL is not set.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrismaClient()[prop as keyof PrismaClient];
  },
});
