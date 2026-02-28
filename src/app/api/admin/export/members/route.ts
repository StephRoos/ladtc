import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCsv } from "@/lib/csv";

const ALLOWED_ROLES = ["COMMITTEE", "ADMIN"] as const;

/**
 * GET /api/admin/export/members
 * Exports all members as CSV. Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!ALLOWED_ROLES.includes(userRole as (typeof ALLOWED_ROLES)[number])) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: { membership: true },
    orderBy: { name: "asc" },
  });

  const headers = [
    "Nom",
    "Email",
    "Rôle",
    "Statut cotisation",
    "Téléphone",
    "Contact urgence",
    "Tél urgence",
    "Inscription",
    "Renouvellement",
    "Dernier paiement",
    "Montant",
  ];

  const rows = users.map((user) => {
    const m = user.membership;
    return [
      user.name ?? "",
      user.email,
      user.role,
      m?.status ?? "N/A",
      m?.phone ?? "",
      m?.emergencyContact ?? "",
      m?.emergencyContactPhone ?? "",
      m ? new Date(m.joinedAt).toLocaleDateString("fr-BE") : "",
      m ? new Date(m.renewalDate).toLocaleDateString("fr-BE") : "",
      m?.paidAt ? new Date(m.paidAt).toLocaleDateString("fr-BE") : "",
      m ? m.amount.toFixed(2) : "",
    ];
  });

  const csv = generateCsv(headers, rows);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `membres-ladtc-${today}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
