import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCsv } from "@/lib/csv";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";

/**
 * GET /api/admin/export/members
 * Exports all members as CSV. Restricted to COMMITTEE and ADMIN roles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

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
