import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 * Health check endpoint for Docker and load balancer probes.
 * Returns 200 when the app and database are operational, 503 otherwise.
 */
export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  const version = process.env.npm_package_version ?? "0.1.0";

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      { status: "ok", timestamp, version, db: "ok" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Health] Database check failed:", error);

    return NextResponse.json(
      { status: "error", timestamp, version, db: "unavailable" },
      { status: 503 }
    );
  }
}
