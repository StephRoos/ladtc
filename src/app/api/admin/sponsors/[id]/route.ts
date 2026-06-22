import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import type { SponsorTier } from "@/types/sponsor";

/**
 * GET /api/admin/sponsors/:id - Fetch a single sponsor by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  try {
    const { id } = await params;
    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
    });

    if (!sponsor) {
      return NextResponse.json(
        { error: "Sponsor non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ sponsor });
  } catch (error) {
    console.error("Error fetching sponsor:", error);
    return NextResponse.json(
      { error: "Impossible de charger le sponsor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/sponsors/:id - Update a sponsor (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  try {
    const { id } = await params;
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

    // Check if sponsor exists
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id },
    });

    if (!existingSponsor) {
      return NextResponse.json(
        { error: "Sponsor non trouvé" },
        { status: 404 }
      );
    }

    // Update the sponsor
    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        name: body.name,
        logoUrl: body.logoUrl !== undefined ? body.logoUrl : existingSponsor.logoUrl,
        tier: body.tier || existingSponsor.tier,
        websiteUrl:
          body.websiteUrl !== undefined ? body.websiteUrl : existingSponsor.websiteUrl,
        order: body.order !== undefined ? body.order : existingSponsor.order,
        isActive:
          body.isActive !== undefined ? body.isActive : existingSponsor.isActive,
      },
    });

    return NextResponse.json({
      sponsor,
      message: "Sponsor mis à jour avec succès",
    });
  } catch (error) {
    console.error("Error updating sponsor:", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le sponsor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/sponsors/:id - Delete a sponsor (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  try {
    const { id } = await params;

    // Check if sponsor exists
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id },
    });

    if (!existingSponsor) {
      return NextResponse.json(
        { error: "Sponsor non trouvé" },
        { status: 404 }
      );
    }

    // Delete the sponsor
    await prisma.sponsor.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Sponsor supprimé avec succès",
    });
  } catch (error) {
    console.error("Error deleting sponsor:", error);
    return NextResponse.json(
      { error: "Impossible de supprimer le sponsor" },
      { status: 500 }
    );
  }
}
