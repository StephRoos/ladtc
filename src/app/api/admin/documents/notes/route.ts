import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { DocumentCategory } from "@/generated/prisma/client";

const VALID_CATEGORIES: DocumentCategory[] = ["PV", "NOTES", "ADMIN", "FINANCES", "OTHER"];
const MAX_CONTENT_LENGTH = 100_000; // ~100KB of Markdown text

/**
 * POST /api/admin/documents/notes
 * Create an inline Markdown note (no file upload).
 * Restricted to COMMITTEE and ADMIN.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const body = await request.json();
  const title = (body.title as string | undefined)?.trim();
  const content = (body.content as string | undefined)?.trim();
  const category = body.category as DocumentCategory | undefined;

  if (!title) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: "Le contenu est requis" }, { status: 400 });
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: "Le contenu dépasse la limite de 100 000 caractères" },
      { status: 400 }
    );
  }

  const validCategory =
    category && VALID_CATEGORIES.includes(category) ? category : "NOTES";

  const document = await prisma.document.create({
    data: {
      title,
      content,
      category: validCategory,
      uploadedById: authResult.user.id,
    },
    include: {
      uploadedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
