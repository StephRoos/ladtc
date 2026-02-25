import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/events/[id]/register
 * Register the current user for an event. Requires authentication.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  if (
    event.maxParticipants &&
    event._count.registrations >= event.maxParticipants
  ) {
    return NextResponse.json({ error: "Événement complet" }, { status: 409 });
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId: id } },
  });

  if (existing && existing.status === "REGISTERED") {
    return NextResponse.json({ error: "Déjà inscrit" }, { status: 409 });
  }

  const registration = existing
    ? await prisma.eventRegistration.update({
        where: { id: existing.id },
        data: { status: "REGISTERED" },
      })
    : await prisma.eventRegistration.create({
        data: {
          userId: session.user.id,
          eventId: id,
        },
      });

  return NextResponse.json({ registration }, { status: 201 });
}

/**
 * DELETE /api/events/[id]/register
 * Unregister the current user from an event. Requires authentication.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId: id } },
  });

  if (!existing || existing.status === "CANCELLED") {
    return NextResponse.json({ error: "Pas d'inscription trouvée" }, { status: 404 });
  }

  await prisma.eventRegistration.update({
    where: { id: existing.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
}
