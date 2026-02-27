"use client";

import { useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { useMembers, useMemberStats } from "@/hooks/use-members";
import { MemberTable } from "@/components/admin/MemberTable";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Admin members management page.
 * Displays stats cards, filters, and the full members table.
 * Requires COMMITTEE or ADMIN role.
 */
export default function AdminMembersPage(): React.ReactNode {
  useRequireAuth();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("name");
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useMemberStats();
  const { data: membersData, isLoading: membersLoading } = useMembers({
    status: statusFilter || undefined,
    search: search || undefined,
    sort,
    page,
  });

  async function handleSendReminder(memberId: string): Promise<void> {
    try {
      const res = await fetch(`/api/members/${memberId}/send-reminder`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        alert(err.error ?? "Erreur lors de l'envoi du rappel");
        return;
      }
      const result = (await res.json()) as { message?: string };
      alert(result.message ?? "Rappel envoyé");
    } catch {
      alert("Erreur lors de l'envoi du rappel");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des membres</h1>
        <Button asChild>
          <Link href="/members/new">Nouveau membre</Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total membres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.total ?? 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.newThisWeek ?? 0} nouveaux cette semaine
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-400">
                  Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.active ?? 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.upcomingRenewals ?? 0} renouvellements dans 30j
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-400">
                  En attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.pending ?? 0}</p>
                <p className="text-xs text-muted-foreground">paiement à confirmer</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-400">
                  Expirés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.expired ?? 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.revenue.toFixed(2) ?? "0.00"} EUR encaissés
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64"
        />
        <Select
          value={statusFilter || "all"}
          onValueChange={(val) => {
            setStatusFilter(val === "all" ? "" : val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="ACTIVE">Actifs</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="INACTIVE">Inactifs</SelectItem>
            <SelectItem value="EXPIRED">Expirés</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nom</SelectItem>
            <SelectItem value="joinedAt">Date d&apos;inscription</SelectItem>
            <SelectItem value="renewalDate">Date de renouvellement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members table */}
      <MemberTable
        members={membersData?.members ?? []}
        onSendReminder={handleSendReminder}
        isLoading={membersLoading}
      />

      {/* Pagination */}
      {membersData && membersData.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {membersData.total} membre{membersData.total > 1 ? "s" : ""} — page{" "}
            {membersData.page} sur {membersData.pages}
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
              disabled={page >= membersData.pages}
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
