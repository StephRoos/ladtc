"use client";

import { useState } from "react";
import { useDocuments, useDeleteDocument } from "@/hooks/use-documents";
import { DocumentUploadForm } from "@/components/admin/documents/DocumentUploadForm";
import { DocumentTable } from "@/components/admin/documents/DocumentTable";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "", label: "Toutes" },
  { value: "PV", label: "Procès-verbaux" },
  { value: "NOTES", label: "Notes de réunion" },
  { value: "ADMIN", label: "Administratif" },
  { value: "FINANCES", label: "Finances" },
  { value: "OTHER", label: "Autre" },
];

/**
 * Admin documents management page — upload, browse, and delete committee documents.
 */
export default function AdminDocumentsPage(): React.ReactNode {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const { data, isLoading, isError } = useDocuments(categoryFilter || undefined);
  const deleteMutation = useDeleteDocument();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Documents comité</h1>
        <Button onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? "Fermer" : "Ajouter un document"}
        </Button>
      </div>

      {showUpload && (
        <div className="mb-8">
          <DocumentUploadForm onSuccess={() => setShowUpload(false)} />
        </div>
      )}

      {/* Category filter */}
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
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
