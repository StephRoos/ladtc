import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SponsorTier } from "@/types/sponsor";

/**
 * GET /api/sponsors - Fetch all active sponsors, optionally filtered by tier.
 * Public route - no authentication required.
 * @param tier - Optional filter by sponsor tier (GOLD, SILVER, BRONZE, SUPPORTER, AMI)
 * @param limit - Optional limit for homepage display
 */
export async function GET(
  request: Request
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get("tier") as SponsorTier | null;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : null;

  try {
    const query = {
      where: {
        isActive: true,
        ...(tier && { tier }),
      },
      orderBy: [
        { tier: "asc" as const },
        { order: "asc" as const },
        { name: "asc" as const },
      ],
      ...(limit && { take: limit }),
    };

    const sponsors = await prisma.sponsor.findMany(query);

    return NextResponse.json({ sponsors, total: sponsors.length });
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return NextResponse.json(
      { error: "Impossible de charger les sponsors" },
      { status: 500 }
    );
  }
}
