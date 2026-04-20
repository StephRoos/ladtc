"use client";

import { useState, useRef } from "react";
import { useUploadDocument } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  { value: "PV", label: "Procès-verbal" },
  { value: "NOTES", label: "Notes de réunion" },
  { value: "ADMIN", label: "Administratif" },
  { value: "FINANCES", label: "Finances" },
  { value: "OTHER", label: "Autre" },
];

interface DocumentUploadFormProps {
  onSuccess?: () => void;
}

/**
 * Form to upload a new committee document with title and category.
 */
export function DocumentUploadForm({ onSuccess }: DocumentUploadFormProps): React.ReactNode {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("PV");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument();

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setError(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Sélectionner un fichier");
      return;
    }
    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    formData.append("category", category);

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        setTitle("");
        setCategory("PV");
        if (fileRef.current) fileRef.current.value = "";
        onSuccess?.();
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-border bg-card p-6"
    >
      <h2 className="text-lg font-semibold text-foreground">Nouveau document</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="doc-title" className="text-sm font-medium text-foreground">
            Titre
          </label>
          <Input
            id="doc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: PV réunion comité avril 2026"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="doc-category" className="text-sm font-medium text-foreground">
            Catégorie
          </label>
          <select
            id="doc-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="doc-file" className="text-sm font-medium text-foreground">
          Fichier (PDF, Word, Excel, image — max 10 Mo)
        </label>
        <input
          id="doc-file"
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={uploadMutation.isPending}>
        {uploadMutation.isPending ? "Upload en cours..." : "Ajouter le document"}
      </Button>
    </form>
  );
}
