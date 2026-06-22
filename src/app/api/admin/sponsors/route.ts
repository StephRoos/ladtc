import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import type { SponsorTier } from "@/types/sponsor";

/**
 * GET /api/admin/sponsors - Fetch all sponsors (admin only)
 * Supports pagination and filtering
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "20", 10);
    const tier = searchParams.get("tier") as SponsorTier | null;
    const isActive = searchParams.get("isActive")
      ? searchParams.get("isActive") === "true"
      : null;
    const search = searchParams.get("search") || null;

    // Build query with type-safe Prisma types
    const query = {
      where: {
        ...(tier && { tier }),
        ...(isActive !== null && { isActive }),
        ...(search && { name: { contains: search, mode: "insensitive" as const } }),
      },
      orderBy: [
        { tier: "asc" as const },
        { order: "asc" as const },
        { name: "asc" as const },
      ],
      skip: (page - 1) * perPage,
      take: perPage,
    };

    const [sponsors, total] = await Promise.all([
      prisma.sponsor.findMany(query),
      prisma.sponsor.count({ where: query.where }),
    ]);

    const pages = Math.ceil(total / perPage);

    return NextResponse.json({
      sponsors,
      total,
      page,
      pages,
      perPage,
    });
  } catch (error) {
    console.error("Error fetching sponsors (admin):", error);
    return NextResponse.json(
      { error: "Impossible de charger les sponsors" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sponsors - Create a new sponsor (admin only)
 * Requires COMMITTEE or ADMIN role
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Le nom du sponsor est requis" },
        { status: 400 }
      );
    }

    // Validate tier
    const validTiers: SponsorTier[] = ["GOLD", "SILVER", "BRONZE"];
    if (body.tier && !validTiers.includes(body.tier)) {
      return NextResponse.json(
        { error: "Tier invalide. Doit être GOLD, SILVER ou BRONZE" },
        { status: 400 }
      );
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        name: body.name,
        logoUrl: body.logoUrl || null,
        tier: body.tier || "BRONZE",
        websiteUrl: body.websiteUrl || null,
        order: body.order || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    return NextResponse.json({ sponsor, message: "Sponsor créé avec succès" });
  } catch (error) {
    console.error("Error creating sponsor:", error);
    return NextResponse.json(
      { error: "Impossible de créer le sponsor" },
      { status: 500 }
    );
  }
}
