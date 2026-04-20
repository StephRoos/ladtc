"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Document {
  id: string;
  title: string;
  category: string;
  content: string | null;
  filePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: { id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
}

interface DocumentsResponse {
  documents: Document[];
}

/**
 * Fetch committee documents, optionally filtered by category.
 */
export function useDocuments(category?: string) {
  const params = category ? `?category=${category}` : "";
  return useQuery<DocumentsResponse>({
    queryKey: ["documents", category ?? "all"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/documents${params}`);
      if (!res.ok) throw new Error("Impossible de charger les documents");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Upload a new document.
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation<Document, Error, FormData>({
    mutationFn: async (formData) => {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erreur lors de l'upload");
      }
      return data.document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

/**
 * Create an inline Markdown note.
 */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation<Document, Error, { title: string; content: string; category: string }>({
    mutationFn: async (payload) => {
      const res = await fetch("/api/admin/documents/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erreur lors de la création");
      }
      return data.document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

/**
 * Update an existing Markdown note.
 */
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation<Document, Error, { id: string; title?: string; content?: string; category?: string }>({
    mutationFn: async ({ id, ...payload }) => {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erreur lors de la mise à jour");
      }
      return data.document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

/**
 * Delete a document by ID.
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
