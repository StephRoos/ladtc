"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GalleryPhoto } from "@/types";
import type { GalleryPhotoFormData } from "@/lib/schemas";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

interface GalleryResponse {
  photos: GalleryPhoto[];
  total: number;
  totalPages: number;
  categories: string[];
}

interface AdminGalleryResponse {
  photos: GalleryPhoto[];
}

interface GalleryPhotoResponse {
  photo: GalleryPhoto;
}

/**
 * Fetch gallery photos from the public API
 * @param page - Page number
 * @param perPage - Photos per page
 * @param category - Category filter
 */
async function getGalleryPhotos(
  page: number,
  perPage: number,
  category?: string
): Promise<GalleryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (category) params.set("category", category);

  const res = await fetch(`/api/gallery?${params}`);
  if (!res.ok) {
    throw new Error("Impossible de charger les photos");
  }
  return res.json() as Promise<GalleryResponse>;
}

/**
 * Fetch all gallery photos from the admin API
 */
async function getAdminGalleryPhotos(): Promise<AdminGalleryResponse> {
  const res = await fetch("/api/admin/gallery");
  if (!res.ok) {
    throw new Error("Impossible de charger les photos");
  }
  return res.json() as Promise<AdminGalleryResponse>;
}

/**
 * Upload a new gallery photo (admin only)
 */
async function uploadPhoto(formData: FormData): Promise<GalleryPhotoResponse> {
  const res = await fetch("/api/admin/gallery", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible d'uploader la photo");
  }
  return res.json() as Promise<GalleryPhotoResponse>;
}

/**
 * Update gallery photo metadata (admin only)
 */
async function updatePhoto(
  id: string,
  data: Partial<GalleryPhotoFormData>
): Promise<GalleryPhotoResponse> {
  const res = await fetch(`/api/admin/gallery/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de mettre à jour la photo");
  }
  return res.json() as Promise<GalleryPhotoResponse>;
}

/**
 * Delete a gallery photo (admin only)
 */
async function deletePhoto(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de supprimer la photo");
  }
  return res.json() as Promise<{ success: boolean }>;
}

/**
 * TanStack Query hook for paginated public gallery photos
 * @param page - Page number (default: 1)
 * @param perPage - Photos per page (default: 12)
 * @param category - Category filter (optional)
 */
export function useGallery(
  page: number = 1,
  perPage: number = 12,
  category?: string
) {
  return useQuery({
    queryKey: ["gallery", page, perPage, category],
    queryFn: () => getGalleryPhotos(page, perPage, category),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * TanStack Query hook for all gallery photos (admin)
 */
export function useAdminGallery() {
  return useQuery({
    queryKey: ["admin-gallery"],
    queryFn: getAdminGalleryPhotos,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook to upload a new gallery photo
 */
export function useUploadPhoto() {
  const queryClient = useQueryClient();
  return useMutation<GalleryPhotoResponse, Error, FormData>({
    mutationFn: uploadPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

/**
 * Hook to update gallery photo metadata
 */
export function useUpdatePhoto() {
  const queryClient = useQueryClient();
  return useMutation<
    GalleryPhotoResponse,
    Error,
    { id: string; data: Partial<GalleryPhotoFormData> }
  >({
    mutationFn: ({ id, data }) => updatePhoto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

/**
 * Hook to delete a gallery photo
 */
export function useDeletePhoto() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}
