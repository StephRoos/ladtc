import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { imageRefSchema } from "@/lib/schemas";

const imageUpdateSchema = z.object({ image: imageRefSchema });

/**
 * PATCH /api/admin/users/[id]/image
 * Update a user's avatar image. Restricted to ADMIN only.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = imageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Image invalide";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { image } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { image },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      committeeRole: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logActivity(authResult.user.id, "USER_IMAGE_UPDATED", "user", id, {
    previousImage: target.image,
    newImage: image,
  });

  return NextResponse.json({ user: updated });
}
