import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCommittee, isAuthError } from "@/lib/auth-guard";
import { delLocal } from "@/lib/storage";
import { DocumentCategory } from "@/generated/prisma/client";

const VALID_CATEGORIES: DocumentCategory[] = ["PV", "NOTES", "ADMIN", "FINANCES", "OTHER"];

/**
 * GET /api/admin/documents/[id]
 * Returns a single document (used for viewing notes).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
    include: { uploadedBy: { select: { id: true, name: true } } },
  });
  if (!document) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  return NextResponse.json({ document });
}

/**
 * PUT /api/admin/documents/[id]
 * Update a Markdown note's title, content, or category.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }
  if (!existing.content && existing.filePath) {
    return NextResponse.json({ error: "Seules les notes peuvent être modifiées" }, { status: 400 });
  }

  const body = await request.json();
  const title = (body.title as string | undefined)?.trim();
  const content = (body.content as string | undefined)?.trim();
  const category = body.category as DocumentCategory | undefined;

  const data: Record<string, unknown> = {};
  if (title) data.title = title;
  if (content !== undefined) data.content = content;
  if (category && VALID_CATEGORIES.includes(category)) data.category = category;

  const document = await prisma.document.update({
    where: { id },
    data,
    include: { uploadedBy: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ document });
}

/**
 * DELETE /api/admin/documents/[id]
 * Removes a document and its file (if any). Restricted to COMMITTEE and ADMIN.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await requireCommittee(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  if (document.filePath) {
    await delLocal(document.filePath);
  }
  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
