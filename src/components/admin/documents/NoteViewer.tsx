"use client";

import { marked } from "marked";
import { Button } from "@/components/ui/button";

interface NoteViewerProps {
  title: string;
  content: string;
  onClose: () => void;
  onEdit: () => void;
}

/**
 * Full-page Markdown viewer for inline notes.
 */
export function NoteViewer({ title, content, onClose, onEdit }: NoteViewerProps): React.ReactNode {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Modifier
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
      />
    </div>
  );
}
