import { NextResponse } from "next/server";

/**
 * GET /api/debug
 * Temporary diagnostic endpoint to identify Prisma initialization failure.
 */
export async function GET(): Promise<NextResponse> {
  const steps: Record<string, string> = {};

  // Step 1: Check env var
  steps.DATABASE_URL = process.env.DATABASE_URL ? "set" : "MISSING";

  // Step 2: Try importing PrismaClient
  try {
    const { PrismaClient } = await import("@/generated/prisma/client");
    steps.PrismaClient = "imported OK";

    // Step 3: Try importing PrismaPg
    try {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      steps.PrismaPg = "imported OK";

      // Step 4: Try creating adapter
      try {
        const adapter = new PrismaPg({
          connectionString: process.env.DATABASE_URL,
        });
        steps.adapter = "created OK";

        // Step 5: Try creating PrismaClient with adapter
        try {
          const client = new PrismaClient({ adapter } as never);
          steps.client = "created OK";

          // Step 6: Try a query
          try {
            await client.$queryRaw`SELECT 1 as ok`;
            steps.query = "OK";
          } catch (e) {
            steps.query = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
          } finally {
            await client.$disconnect().catch(() => {});
          }
        } catch (e) {
          steps.client = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
        }
      } catch (e) {
        steps.adapter = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
      }
    } catch (e) {
      steps.PrismaPg = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
    }
  } catch (e) {
    steps.PrismaClient = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(steps);
}
