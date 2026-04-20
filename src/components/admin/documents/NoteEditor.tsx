"use client";

import { useState } from "react";
import { useCreateNote, useUpdateNote } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { marked } from "marked";

const CATEGORIES = [
  { value: "PV", label: "Procès-verbal" },
  { value: "NOTES", label: "Notes de réunion" },
  { value: "ADMIN", label: "Administratif" },
  { value: "FINANCES", label: "Finances" },
  { value: "OTHER", label: "Autre" },
];

interface NoteEditorProps {
  /** If provided, we're editing an existing note */
  editId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialCategory?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Markdown note editor with live preview. Supports create and edit modes.
 */
export function NoteEditor({
  editId,
  initialTitle = "",
  initialContent = "",
  initialCategory = "PV",
  onSuccess,
  onCancel,
}: NoteEditorProps): React.ReactNode {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [category, setCategory] = useState(initialCategory);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const isPending = createNote.isPending || updateNote.isPending;

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }
    if (!content.trim()) {
      setError("Le contenu est requis");
      return;
    }

    const payload = { title: title.trim(), content: content.trim(), category };

    if (editId) {
      updateNote.mutate(
        { id: editId, ...payload },
        {
          onSuccess: () => onSuccess?.(),
          onError: (err) => setError(err.message),
        }
      );
    } else {
      createNote.mutate(payload, {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setCategory("PV");
          onSuccess?.();
        },
        onError: (err) => setError(err.message),
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-border bg-card p-6"
    >
      <h2 className="text-lg font-semibold text-foreground">
        {editId ? "Modifier la note" : "Rédiger une note"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="note-title" className="text-sm font-medium text-foreground">
            Titre
          </label>
          <Input
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: PV réunion comité avril 2026"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="note-category" className="text-sm font-medium text-foreground">
            Catégorie
          </label>
          <select
            id="note-category"
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

      {/* Tabs: Écrire / Aperçu */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              !showPreview
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Écrire
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              showPreview
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Aperçu
          </button>
        </div>

        {showPreview ? (
          <div
            className="prose prose-sm dark:prose-invert min-h-[200px] max-w-none rounded-md border border-border bg-background p-4"
            dangerouslySetInnerHTML={{ __html: marked.parse(content || "*Rien à afficher*") as string }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenu en Markdown...&#10;&#10;## Présents&#10;- Marie, Jean, Pierre&#10;&#10;## Ordre du jour&#10;1. Point financier&#10;2. Organisation prochaine course"
            className="min-h-[200px] w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Enregistrement..."
            : editId
              ? "Mettre à jour"
              : "Enregistrer la note"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}
