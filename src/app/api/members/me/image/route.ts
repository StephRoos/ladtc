import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { imageRefSchema } from "@/lib/schemas";

const imageUpdateSchema = z.object({ image: imageRefSchema });

/**
 * PATCH /api/members/me/image
 * Self-service avatar update: the current authenticated user can set or clear
 * their own profile photo. Separate from /api/admin/users/[id]/image (which
 * is committee-only and lets the committee edit anyone's avatar).
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

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

  const target = await prisma.user.findUnique({
    where: { id: authResult.user.id },
    select: { image: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: authResult.user.id },
    data: { image },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      committeeRole: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logActivity(authResult.user.id, "USER_IMAGE_UPDATED", "user", authResult.user.id, {
    previousImage: target.image,
    newImage: image,
  });

  return NextResponse.json({ user: updated });
}
