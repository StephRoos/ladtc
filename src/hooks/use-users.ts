"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, UserRole } from "@/types";

interface UsersListResponse {
  users: User[];
  total: number;
  pages: number;
  page: number;
}

/**
 * Fetch all users with pagination.
 */
async function fetchUsers(page: number): Promise<UsersListResponse> {
  const res = await fetch(`/api/admin/users?page=${page}`);
  if (!res.ok) {
    throw new Error("Impossible de charger les utilisateurs");
  }
  return res.json() as Promise<UsersListResponse>;
}

/**
 * Update a user's role via the API.
 */
async function updateUserRole(id: string, role: UserRole): Promise<{ user: User }> {
  const res = await fetch(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Impossible de modifier le rôle");
  }
  return res.json() as Promise<{ user: User }>;
}

/**
 * Hook to fetch the users list for role management.
 *
 * @param page - Current page number
 * @returns TanStack Query result with paginated users
 */
export function useUsers(
  page: number = 1
): ReturnType<typeof useQuery<UsersListResponse>> {
  return useQuery<UsersListResponse>({
    queryKey: ["admin-users", page],
    queryFn: () => fetchUsers(page),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to update a user's role. Invalidates users list on success.
 */
export function useUpdateUserRole(): ReturnType<
  typeof useMutation<{ user: User }, Error, { id: string; role: UserRole }>
> {
  const queryClient = useQueryClient();

  return useMutation<{ user: User }, Error, { id: string; role: UserRole }>({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
