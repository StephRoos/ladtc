"use client";

import type { Document } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onViewNote: (doc: Document) => void;
  isDeleting: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  PV: "Procès-verbal",
  NOTES: "Notes",
  ADMIN: "Administratif",
  FINANCES: "Finances",
  OTHER: "Autre",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Table displaying committee documents with download/view and delete actions.
 */
export function DocumentTable({
  documents,
  isLoading,
  onDelete,
  onViewNote,
  isDeleting,
}: DocumentTableProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/30 px-4 py-8 text-center text-muted-foreground">
        Aucun document dans cette catégorie.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">Titre</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Catégorie</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Taille</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Ajouté par</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {documents.map((doc) => {
            const isNote = !!doc.content;

            return (
              <tr key={doc.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">
                  {doc.title}
                  {!isNote && doc.fileName && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({doc.fileName})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {isNote ? (
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Note
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Fichier</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {CATEGORY_LABELS[doc.category] ?? doc.category}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {isNote
                    ? `${(doc.content!.length / 1024).toFixed(1)} Ko`
                    : doc.fileSize
                      ? formatFileSize(doc.fileSize)
                      : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {doc.uploadedBy.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(doc.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {isNote ? (
                      <button
                        onClick={() => onViewNote(doc)}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                      >
                        Lire
                      </button>
                    ) : (
                      <a
                        href={doc.filePath!}
                        download={doc.fileName!}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                      >
                        Télécharger
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(doc.id)}
                      disabled={isDeleting}
                    >
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
