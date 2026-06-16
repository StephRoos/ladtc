import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSettingRaw, setSetting } from "@/lib/settings";
import { z } from "zod";

const ADMIN_ROLES = ["COMMITTEE", "ADMIN"] as const;

const ALLOWED_KEYS = new Set([
  "equipment.shippingFee",
  "site.dtcMeanings",
  "site.contributionUrl",
]);

const updateSchema = z.object({
  value: z.union([z.number(), z.string(), z.boolean(), z.array(z.string())]),
});

/**
 * GET /api/settings/[key]
 * Returns the current value for a known setting key. Public — values like the
 * shipping fee need to be visible to logged-in members at checkout time.
 *
 * Response: { key, value } where `value` is the decoded JSON or null if unset.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
): Promise<NextResponse> {
  const { key } = await params;

  if (!ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: "Clé inconnue" }, { status: 404 });
  }

  const raw = await getSettingRaw(key);
  const value = raw === null ? null : (JSON.parse(raw) as unknown);

  return NextResponse.json({ key, value });
}

/**
 * PATCH /api/settings/[key]
 * Updates the value for a known setting key. Restricted to COMMITTEE and ADMIN.
 *
 * Body: { value: number | string | boolean }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ADMIN_ROLES.includes(userRole as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { key } = await params;
  if (!ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: "Clé inconnue" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // Domain-specific guard: shipping fee must be a non-negative number.
  if (key === "equipment.shippingFee") {
    const v = parsed.data.value;
    if (typeof v !== "number" || v < 0 || !Number.isFinite(v)) {
      return NextResponse.json(
        { error: "Le frais de livraison doit être un nombre positif ou zéro" },
        { status: 422 }
      );
    }
  }

  // Subtitles: must be a list of strings; trim and drop blanks, then require at
  // least one so the header always has something to show.
  let valueToStore = parsed.data.value;
  if (key === "site.dtcMeanings") {
    if (!Array.isArray(parsed.data.value)) {
      return NextResponse.json(
        { error: "Les sous-titres doivent être une liste" },
        { status: 422 }
      );
    }
    const cleaned = parsed.data.value
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (cleaned.length === 0) {
      return NextResponse.json(
        { error: "Ajoutez au moins un sous-titre" },
        { status: 422 }
      );
    }
    valueToStore = cleaned;
  }

  // Contribution link: a trimmed HTTPS URL, or empty string to hide the button.
  if (key === "site.contributionUrl") {
    if (typeof parsed.data.value !== "string") {
      return NextResponse.json(
        { error: "Le lien doit être une chaîne" },
        { status: 422 }
      );
    }
    const trimmed = parsed.data.value.trim();
    if (trimmed && !/^https:\/\/\S+$/i.test(trimmed)) {
      return NextResponse.json(
        { error: "Le lien doit être une URL HTTPS (ou vide pour masquer le bouton)" },
        { status: 422 }
      );
    }
    valueToStore = trimmed;
  }

  await setSetting(key, valueToStore);

  return NextResponse.json({ key, value: valueToStore });
}
