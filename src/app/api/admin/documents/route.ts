import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { putLocal } from "@/lib/storage";
import { DocumentCategory } from "@/generated/prisma/client";


const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const VALID_CATEGORIES: DocumentCategory[] = ["PV", "NOTES", "ADMIN", "FINANCES", "OTHER"];

/**
 * GET /api/admin/documents
 * Returns all documents. Optionally filter by category.
 * Restricted to COMMITTEE and ADMIN.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as DocumentCategory | null;

  const where = category && VALID_CATEGORIES.includes(category) ? { category } : {};

  const documents = await prisma.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ documents });
}

/**
 * POST /api/admin/documents
 * Upload a new document. Receives FormData with file + metadata.
 * Restricted to COMMITTEE and ADMIN.
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
      { error: "Type de fichier non autorisé. Formats acceptés : PDF, Word, Excel, JPG, PNG, WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Le fichier dépasse la taille maximale de 10 Mo" },
      { status: 400 }
    );
  }

  const title = (formData.get("title") as string | null)?.trim();
  const category = formData.get("category") as DocumentCategory | null;

  if (!title) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
  }

  const validCategory =
    category && VALID_CATEGORIES.includes(category) ? category : "OTHER";

  const result = await putLocal(file, "documents");

  const document = await prisma.document.create({
    data: {
      title,
      category: validCategory,
      filePath: result.url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedById: authResult.user.id,
    },
    include: {
      uploadedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
