"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Document {
  id: string;
  title: string;
  category: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: { id: string; name: string | null };
  createdAt: string;
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
 * Delete a document by ID.
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
