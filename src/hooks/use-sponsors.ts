"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Sponsor,
  SponsorTier,
  SponsorFormData,
  SponsorsResponse,
  SponsorResponse,
} from "@/types/sponsor";

/** Default query configuration for sponsors */
const SPONSORS_QUERY_KEY = ["sponsors"];
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_GC_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch public sponsors (active only)
 * Used for public pages like /sponsors and homepage
 */
export function usePublicSponsors(limit?: number) {
  return useQuery<SponsorsResponse>({
    queryKey: ["public-sponsors", limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) {
        params.set("limit", limit.toString());
      }
      const res = await fetch(`/api/sponsors?${params.toString()}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch sponsors");
      }

      return res.json();
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

/**
 * Fetch all sponsors for admin (includes inactive)
 * Requires COMMITTEE or ADMIN role
 */
export function useAdminSponsors(
  page: number = 1,
  perPage: number = 20,
  tier?: SponsorTier,
  isActive?: boolean,
  search?: string
) {
  return useQuery<{
    sponsors: Sponsor[];
    total: number;
    page: number;
    pages: number;
    perPage: number;
  }>({
    queryKey: ["admin-sponsors", page, perPage, tier, isActive, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("perPage", perPage.toString());
      if (tier) {
        params.set("tier", tier);
      }
      if (isActive !== undefined) {
        params.set("isActive", isActive.toString());
      }
      if (search) {
        params.set("search", search);
      }

      const res = await fetch(`/api/admin/sponsors?${params.toString()}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch sponsors");
      }

      return res.json();
    },
    staleTime: 0, // Always fresh for admin data
    gcTime: DEFAULT_GC_TIME,
  });
}

/**
 * Fetch a single sponsor by ID (admin)
 */
export function useSponsor(id: string | null) {
  return useQuery<SponsorResponse>({
    queryKey: ["sponsor", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Sponsor ID is required");
      }

      const res = await fetch(`/api/admin/sponsors/${id}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch sponsor");
      }

      return res.json();
    },
    staleTime: 0,
    gcTime: DEFAULT_GC_TIME,
    enabled: !!id,
  });
}

/**
 * Mutation to create a new sponsor
 */
export function useCreateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SponsorFormData) => {
      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create sponsor");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["public-sponsors"] });
    },
  });
}

/**
 * Mutation to update a sponsor
 */
export function useUpdateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; formData: SponsorFormData }) => {
      const { id, formData } = data;
      const res = await fetch(`/api/admin/sponsors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update sponsor");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["public-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["sponsor"] });
    },
  });
}

/**
 * Mutation to delete a sponsor
 */
export function useDeleteSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sponsors/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete sponsor");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["public-sponsors"] });
    },
  });
}

/**
 * Mutation to upload a sponsor logo
 */
export function useUploadSponsorLogo() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload/sponsor", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload logo");
      }

      return res.json();
    },
  });
}
