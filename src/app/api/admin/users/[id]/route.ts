import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";

/**
 * DELETE /api/admin/users/[id]
 * Delete a user. Restricted to ADMIN.
 * Refuses to delete: self, the last remaining ADMIN, or users with authored
 * blog posts or uploaded gallery photos (those must be reassigned first).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  if (id === authResult.user.id) {
    return NextResponse.json(
      { error: "Impossible de supprimer son propre compte" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      _count: { select: { blogPosts: true, galleryPhotos: true } },
    },
  });

  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Impossible de supprimer le dernier administrateur" },
        { status: 400 }
      );
    }
  }

  if (target._count.blogPosts > 0 || target._count.galleryPhotos > 0) {
    return NextResponse.json(
      {
        error:
          "Cet utilisateur a publié du contenu (articles ou photos). Réattribuer ou supprimer ce contenu avant de supprimer le compte.",
      },
      { status: 409 }
    );
  }

  await logActivity(authResult.user.id, "USER_DELETED", "user", id, {
    email: target.email,
    name: target.name,
    role: target.role,
  });

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
