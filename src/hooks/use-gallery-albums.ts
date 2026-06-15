"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GalleryAlbum,
  GalleryAlbumSummary,
  GalleryPhoto,
} from "@/types";
import type { GalleryAlbumFormData } from "@/lib/schemas";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

/** Album enriched with a photo count, as returned by the admin albums endpoint. */
export interface AdminAlbum extends GalleryAlbum {
  photoCount: number;
}

/** A single album together with its photos (public detail endpoint). */
export interface AlbumWithPhotos extends GalleryAlbum {
  photos: GalleryPhoto[];
}

async function errorMessageFrom(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => "");
  if (text) {
    try {
      const data = JSON.parse(text) as { error?: string };
      if (data.error) return data.error;
    } catch {
      // Body was not JSON — fall through to the generic message.
    }
  }
  return `${fallback} (erreur ${res.status})`;
}

// --- Public reads --------------------------------------------------------

async function getAlbums(): Promise<GalleryAlbumSummary[]> {
  const res = await fetch("/api/gallery/albums");
  if (!res.ok) throw new Error("Impossible de charger les albums");
  const data = (await res.json()) as { albums: GalleryAlbumSummary[] };
  return data.albums;
}

async function getAlbum(slug: string): Promise<AlbumWithPhotos> {
  const res = await fetch(`/api/gallery/albums/${slug}`);
  if (!res.ok) throw new Error(await errorMessageFrom(res, "Album introuvable"));
  const data = (await res.json()) as { album: AlbumWithPhotos };
  return data.album;
}

/** Public list of albums (event folders) with cover + photo count. */
export function useGalleryAlbums() {
  return useQuery({
    queryKey: ["gallery-albums"],
    queryFn: getAlbums,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/** Public single album with its photos. */
export function useGalleryAlbum(slug: string) {
  return useQuery({
    queryKey: ["gallery-album", slug],
    queryFn: () => getAlbum(slug),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: Boolean(slug),
  });
}

// --- Admin reads + mutations --------------------------------------------

async function getAdminAlbums(): Promise<AdminAlbum[]> {
  const res = await fetch("/api/admin/gallery/albums");
  if (!res.ok) throw new Error("Impossible de charger les albums");
  const data = (await res.json()) as { albums: AdminAlbum[] };
  return data.albums;
}

async function createAlbum(data: GalleryAlbumFormData): Promise<GalleryAlbum> {
  const res = await fetch("/api/admin/gallery/albums", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await errorMessageFrom(res, "Impossible de créer l'album"));
  return (await res.json()).album as GalleryAlbum;
}

async function updateAlbum(
  id: string,
  data: Partial<GalleryAlbumFormData>
): Promise<GalleryAlbum> {
  const res = await fetch(`/api/admin/gallery/albums/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await errorMessageFrom(res, "Impossible de modifier l'album"));
  return (await res.json()).album as GalleryAlbum;
}

async function deleteAlbum(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/admin/gallery/albums/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await errorMessageFrom(res, "Impossible de supprimer l'album"));
  return (await res.json()) as { success: boolean };
}

/** Admin list of albums with photo counts. */
export function useAdminAlbums() {
  return useQuery({
    queryKey: ["admin-gallery-albums"],
    queryFn: getAdminAlbums,
    staleTime: STALE_TIME,
  });
}

/**
 * Invalidate every query that depends on albums after a mutation: the admin
 * list, the public album grid, and the gallery photos (album labels change).
 */
function useAlbumInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin-gallery-albums"] });
    queryClient.invalidateQueries({ queryKey: ["gallery-albums"] });
    queryClient.invalidateQueries({ queryKey: ["gallery-album"] });
    queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
  };
}

export function useCreateAlbum() {
  const invalidate = useAlbumInvalidation();
  return useMutation<GalleryAlbum, Error, GalleryAlbumFormData>({
    mutationFn: createAlbum,
    onSuccess: invalidate,
  });
}

export function useUpdateAlbum() {
  const invalidate = useAlbumInvalidation();
  return useMutation<
    GalleryAlbum,
    Error,
    { id: string; data: Partial<GalleryAlbumFormData> }
  >({
    mutationFn: ({ id, data }) => updateAlbum(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteAlbum() {
  const invalidate = useAlbumInvalidation();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteAlbum,
    onSuccess: invalidate,
  });
}
