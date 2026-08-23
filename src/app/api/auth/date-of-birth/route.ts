import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  dateOfBirth: z.string().date(),
});

/**
 * POST /api/auth/date-of-birth
 * Saves the date of birth right after signUp.email, before email verification.
 * The user exists in the database at this point (BetterAuth creates the row
 * on sign-up), but has no session yet — so we identify by email instead of
 * using requireAuth.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { email, dateOfBirth } = parsed.data;

  await prisma.user.updateMany({
    where: { email },
    data: { dateOfBirth: new Date(dateOfBirth) },
  });

  return NextResponse.json({ ok: true });
}
