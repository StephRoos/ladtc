"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/use-auth";
import {
  useAdminSponsors,
  useCreateSponsor,
  useUpdateSponsor,
  useDeleteSponsor,
} from "@/hooks/use-sponsors";
import { SponsorTable } from "@/components/admin/sponsors/SponsorTable";
import { SponsorForm } from "@/components/admin/sponsors/SponsorForm";
import type { Sponsor, SponsorFormData } from "@/types/sponsor";

/**
 * Admin sponsors management page.
 * Features:
 * - CRUD operations for sponsors
 * - Pagination, filtering, and search
 * - Dialog for create/edit forms
 * - Confirmation for delete actions
 * - TanStack Query for data fetching
 * - Requires COMMITTEE or ADMIN role
 */
export default function AdminSponsorsPage(): React.ReactNode {
  useRequireAuth("/auth/login?callbackUrl=/admin/sponsors");

  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [tierFilter, setTierFilter] = useState<"GOLD" | "SILVER" | "BRONZE" | "">("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | "">("");
  const [search, setSearch] = useState("");

  // State for dialogs
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | null>(null);

  // Queries and mutations
  const {
    data: sponsorsData,
    isLoading: sponsorsLoading,
    isError: sponsorsError,
  } = useAdminSponsors(page, perPage, tierFilter || undefined, isActiveFilter || undefined, search || undefined);

  const createSponsorMutation = useCreateSponsor();
  const updateSponsorMutation = useUpdateSponsor();
  const deleteSponsorMutation = useDeleteSponsor();

  // Action handlers
  const handleCreate = () => {
    setEditingSponsor(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setShowCreateDialog(true);
  };

  const handleDelete = (sponsor: Sponsor) => {
    setSponsorToDelete(sponsor);
    setShowDeleteDialog(true);
  };

  const handleToggleActive = async (sponsor: Sponsor) => {
    try {
      await updateSponsorMutation.mutateAsync({
        id: sponsor.id,
        formData: {
          name: sponsor.name,
          tier: sponsor.tier,
          websiteUrl: sponsor.websiteUrl || undefined,
          order: sponsor.order,
          isActive: !sponsor.isActive,
        },
      });
    } catch (error) {
      console.error("Error toggling sponsor active status:", error);
    }
  };

  const handleFormSubmit = async (data: SponsorFormData) => {
    try {
      if (editingSponsor) {
        // Update existing sponsor
        await updateSponsorMutation.mutateAsync({
          id: editingSponsor.id,
          formData: data,
        });
      } else {
        // Create new sponsor
        await createSponsorMutation.mutateAsync(data);
      }
      setShowCreateDialog(false);
      setEditingSponsor(null);
    } catch (error) {
      console.error("Error saving sponsor:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sponsorToDelete) return;

    try {
      await deleteSponsorMutation.mutateAsync(sponsorToDelete.id);
      setShowDeleteDialog(false);
      setSponsorToDelete(null);
    } catch (error) {
      console.error("Error deleting sponsor:", error);
    }
  };

  const handleFormCancel = () => {
    setShowCreateDialog(false);
    setEditingSponsor(null);
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when filters change
  };

  // Reset filters
  const resetFilters = () => {
    setTierFilter("");
    setIsActiveFilter("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des sponsors</h1>
          <p className="text-muted-foreground">
            Gérez les partenaires du club
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau sponsor
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sponsorsLoading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total sponsors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{sponsorsData?.total ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-500">
                  Or
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {sponsorsData?.sponsors.filter((s) => s.tier === "GOLD").length ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Argent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {sponsorsData?.sponsors.filter((s) => s.tier === "SILVER").length ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-500">
                  Bronze
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {sponsorsData?.sponsors.filter((s) => s.tier === "BRONZE").length ?? 0}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher par nom..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyFilters();
          }}
          className="w-64"
        />
        <Select
          value={tierFilter || ""}
          onValueChange={(val) => {
            setTierFilter(val as "GOLD" | "SILVER" | "BRONZE" | "");
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tous les niveaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les niveaux</SelectItem>
            <SelectItem value="GOLD">Or (Gold)</SelectItem>
            <SelectItem value="SILVER">Argent (Silver)</SelectItem>
            <SelectItem value="BRONZE">Bronze</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={isActiveFilter !== "" ? String(isActiveFilter) : ""}
          onValueChange={(val) => {
            setIsActiveFilter(val === "" ? "" : val === "true");
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les statuts</SelectItem>
            <SelectItem value="true">Actifs</SelectItem>
            <SelectItem value="false">Inactifs</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={applyFilters}>
          Appliquer
        </Button>
        <Button variant="ghost" onClick={resetFilters}>
          Réinitialiser
        </Button>
      </div>

      {/* Table */}
      {sponsorsError ? (
        <div className="rounded-lg border border-destructive bg-destructive/5 p-4 text-destructive">
          Erreur lors du chargement des sponsors. Veuillez réessayer.
        </div>
      ) : (
        <SponsorTable
          sponsors={sponsorsData?.sponsors ?? []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          isLoading={sponsorsLoading}
        />
      )}

      {/* Pagination */}
      {sponsorsData && sponsorsData.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {sponsorsData.total} sponsor{sponsorsData.total > 1 ? "s" : ""} — page{" "}
            {sponsorsData.page} sur {sponsorsData.pages}
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
              disabled={page >= sponsorsData.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSponsor ? "Modifier le sponsor" : "Nouveau sponsor"}
            </DialogTitle>
          </DialogHeader>
          <SponsorForm
            sponsor={editingSponsor}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={
              createSponsorMutation.isPending || updateSponsorMutation.isPending
            }
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer le sponsor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {sponsorToDelete && (
              <p>
                Êtes-vous sûr de vouloir supprimer le sponsor "{sponsorToDelete.name}" ?
                Cette action est irréversible.
              </p>
            )}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteSponsorMutation.isPending}
              >
                {deleteSponsorMutation.isPending ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
