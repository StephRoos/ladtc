import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/schemas";

const ADMIN_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * PATCH /api/admin/events/[id]
 * Partially updates an event. Restricted to COMMITTEE and ADMIN.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ADMIN_ROLES.includes(userRole as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = eventSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const updateData: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.date) {
    updateData.date = new Date(parsed.data.date);
  }
  if (parsed.data.endDate !== undefined) {
    updateData.endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
  }
  if (parsed.data.image !== undefined) {
    updateData.image = parsed.data.image || null;
  }

  try {
    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
      },
    });

    return NextResponse.json({ event });
  } catch (err) {
    console.error("Failed to update event:", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'événement" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Permanently deletes an event. Restricted to COMMITTEE and ADMIN.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ADMIN_ROLES.includes(userRole as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
