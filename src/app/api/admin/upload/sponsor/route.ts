import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { putLocal } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/admin/upload/sponsor - Handle sponsor logo upload.
 * Stores locally under public/uploads/sponsors/.
 * Optimized for WebP format.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: "Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP, GIF",
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Le fichier dépasse la taille maximale de 5 Mo" },
      { status: 400 }
    );
  }

  try {
    const result = await putLocal(file, "sponsors");

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Error uploading sponsor logo:", error);
    return NextResponse.json(
      { error: "Impossible de télécharger le logo du sponsor" },
      { status: 500 }
    );
  }
}
