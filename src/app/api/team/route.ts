import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/team
 * Public route — returns committee members.
 */
export async function GET(): Promise<NextResponse> {
  const members = await prisma.user.findMany({
    where: { role: "COMMITTEE" },
    select: {
      id: true,
      name: true,
      role: true,
      committeeRole: true,
      image: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ members });
}
