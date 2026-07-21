import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { putLocal } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/members/me/upload
 * Self-service image upload for a member's own avatar. Stored in a dedicated
 * `avatars` folder so it can be pruned independently from blog/gallery
 * uploads. Restricted to authenticated users (any role).
 *
 * Returns { url } on success — the caller (ImagePicker) forwards it to
 * PATCH /api/members/me/image to persist it on the User row.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP, GIF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Le fichier dépasse la taille maximale de 5 Mo" },
      { status: 400 }
    );
  }

  const result = await putLocal(file, "avatars");

  return NextResponse.json({ url: result.url });
}
