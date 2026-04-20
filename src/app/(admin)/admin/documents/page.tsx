"use client";

import { useState } from "react";
import { useDocuments, useDeleteDocument } from "@/hooks/use-documents";
import type { Document } from "@/hooks/use-documents";
import { DocumentUploadForm } from "@/components/admin/documents/DocumentUploadForm";
import { DocumentTable } from "@/components/admin/documents/DocumentTable";
import { NoteEditor } from "@/components/admin/documents/NoteEditor";
import { NoteViewer } from "@/components/admin/documents/NoteViewer";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "", label: "Toutes" },
  { value: "PV", label: "Procès-verbaux" },
  { value: "NOTES", label: "Notes de réunion" },
  { value: "ADMIN", label: "Administratif" },
  { value: "FINANCES", label: "Finances" },
  { value: "OTHER", label: "Autre" },
];

type ViewMode = "list" | "upload" | "note" | "view" | "edit";

/**
 * Admin documents management page — upload files, write Markdown notes, browse, and delete.
 */
export default function AdminDocumentsPage(): React.ReactNode {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeNote, setActiveNote] = useState<Document | null>(null);

  const { data, isLoading, isError } = useDocuments(categoryFilter || undefined);
  const deleteMutation = useDeleteDocument();

  function handleViewNote(doc: Document): void {
    setActiveNote(doc);
    setViewMode("view");
  }

  function handleEditNote(): void {
    setViewMode("edit");
  }

  function handleCloseViewer(): void {
    setActiveNote(null);
    setViewMode("list");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Documents comité</h1>
        {viewMode === "list" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode("note")}>
              Rédiger une note
            </Button>
            <Button onClick={() => setViewMode("upload")}>
              Ajouter un fichier
            </Button>
          </div>
        )}
      </div>

      {/* Upload form */}
      {viewMode === "upload" && (
        <div className="mb-8">
          <DocumentUploadForm onSuccess={() => setViewMode("list")} />
          <button
            onClick={() => setViewMode("list")}
            className="mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Note editor (create) */}
      {viewMode === "note" && (
        <div className="mb-8">
          <NoteEditor
            onSuccess={() => setViewMode("list")}
            onCancel={() => setViewMode("list")}
          />
        </div>
      )}

      {/* Note viewer */}
      {viewMode === "view" && activeNote?.content && (
        <div className="mb-8">
          <NoteViewer
            title={activeNote.title}
            content={activeNote.content}
            onClose={handleCloseViewer}
            onEdit={handleEditNote}
          />
        </div>
      )}

      {/* Note editor (edit) */}
      {viewMode === "edit" && activeNote && (
        <div className="mb-8">
          <NoteEditor
            editId={activeNote.id}
            initialTitle={activeNote.title}
            initialContent={activeNote.content ?? ""}
            initialCategory={activeNote.category}
            onSuccess={handleCloseViewer}
            onCancel={() => setViewMode("view")}
          />
        </div>
      )}

      {/* Category filter + document table */}
      {(viewMode === "list" || viewMode === "upload" || viewMode === "note") && (
        <>
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  categoryFilter === cat.value
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-4 text-destructive">
              Impossible de charger les documents.
            </div>
          ) : (
            <DocumentTable
              documents={data?.documents ?? []}
              isLoading={isLoading}
              onDelete={(id) => deleteMutation.mutate(id)}
              onViewNote={handleViewNote}
              isDeleting={deleteMutation.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}
