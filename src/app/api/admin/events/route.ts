import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/schemas";
import { requireCommittee, requireRole, isAuthError, TRAINING_ROLES, COMMITTEE_ROLES } from "@/lib/auth-guard";

/**
 * GET /api/admin/events
 * Returns all events (past and future). Restricted to COMMITTEE and ADMIN.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
    },
  });

  return NextResponse.json({ events });
}

/**
 * POST /api/admin/events
 * Creates a new event. Restricted to COMMITTEE and ADMIN.
 * COACH can only create TRAINING events.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireRole(request, TRAINING_ROLES);
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const isTrainingOnly = !COMMITTEE_ROLES.includes(authResult.user.role);

  if (isTrainingOnly && parsed.data.type !== "TRAINING") {
    return NextResponse.json(
      { error: "Les coachs ne peuvent créer que des entraînements" },
      { status: 403 }
    );
  }

  try {
    const event = await prisma.event.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        date: new Date(parsed.data.date),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        image: parsed.data.image || null,
        location: parsed.data.location,
        type: parsed.data.type,
        difficulty: parsed.data.difficulty ?? null,
        maxParticipants: parsed.data.maxParticipants ?? null,
      },
      include: {
        _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error("Failed to create event:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'événement" },
      { status: 500 }
    );
  }
}
