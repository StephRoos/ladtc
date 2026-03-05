import { NextRequest, NextResponse } from "next/server";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Handle image file upload for blog posts.
 * Stores in Vercel Blob and returns the public URL.
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

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `blog/${randomUUID()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
