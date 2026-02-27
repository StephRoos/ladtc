"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUsers, useUpdateUserRole } from "@/hooks/use-users";
import { RoleSelect } from "@/components/admin/RoleSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { UserRole } from "@/types";
import Link from "next/link";

const ROLE_BADGE_VARIANTS: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
  ADMIN: "destructive",
  COMMITTEE: "default",
  COACH: "secondary",
  MEMBER: "outline",
};

/**
 * Admin-only user role management page.
 * Lists all users and allows changing their roles with confirmation.
 */
export default function AdminUsersPage(): React.ReactNode {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useUsers(page);
  const updateRole = useUpdateUserRole();

  const isAdmin = user && "role" in user && user.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-destructive">Accès refusé</h1>
        <p className="mt-2 text-muted-foreground">
          Cette page est réservée aux administrateurs.
        </p>
        <Link href="/admin/dashboard" className="mt-4 inline-block text-sm text-primary hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  async function handleRoleChange(
    userId: string,
    role: UserRole,
    committeeRole?: string | null,
  ): Promise<void> {
    try {
      await updateRole.mutateAsync({ id: userId, role, committeeRole });
      toast.success("Rôle mis à jour avec succès");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">Gestion des rôles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Attribuez ou modifiez les rôles des utilisateurs. Cette page est réservée aux administrateurs.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle actuel</TableHead>
                <TableHead>Modifier le rôle</TableHead>
                <TableHead>Inscrit le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.users ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGE_VARIANTS[u.role as UserRole] ?? "outline"}>
                      {u.role}
                    </Badge>
                    {u.role === "COMMITTEE" && u.committeeRole && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          — {u.committeeRole}
                        </span>
                      )}
                  </TableCell>
                  <TableCell>
                    {u.id !== user?.id ? (
                      <RoleSelect
                        userId={u.id}
                        currentRole={u.role as UserRole}
                        currentCommitteeRole={u.committeeRole}
                        onRoleChange={handleRoleChange}
                        isLoading={updateRole.isPending}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Votre compte</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("fr-BE")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data.total} utilisateur{data.total > 1 ? "s" : ""} — page {data.page} sur{" "}
            {data.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
