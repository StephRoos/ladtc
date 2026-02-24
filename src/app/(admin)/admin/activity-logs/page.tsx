"use client";

import { useState } from "react";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { ActivityLogTable } from "@/components/admin/ActivityLogTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 20;

const ACTION_OPTIONS = [
  { value: "all", label: "Toutes les actions" },
  { value: "MEMBER_UPDATED", label: "Membre modifié" },
  { value: "MEMBER_ADDED", label: "Membre ajouté" },
  { value: "ORDER_SHIPPED", label: "Commande expédiée" },
  { value: "ORDER_UPDATED", label: "Commande mise à jour" },
  { value: "PRODUCT_CREATED", label: "Produit créé" },
  { value: "PRODUCT_UPDATED", label: "Produit modifié" },
  { value: "USER_ROLE_UPDATED", label: "Rôle modifié" },
];

/**
 * Admin activity logs page with action filter, date range filter and pagination.
 */
export default function AdminActivityLogsPage(): React.ReactNode {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [skip, setSkip] = useState(0);

  const { data, isLoading } = useActivityLogs({
    action: actionFilter !== "all" ? actionFilter : undefined,
    startDate: startDate ? new Date(startDate).toISOString() : undefined,
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
    skip,
    take: PAGE_SIZE,
  });

  const total = data?.total ?? 0;
  const pages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

  function handleFilterChange(): void {
    setSkip(0);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-bold">Logs d&apos;activité</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={actionFilter}
          onValueChange={(val) => {
            setActionFilter(val);
            handleFilterChange();
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Type d'action" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              handleFilterChange();
            }}
            className="w-40"
            aria-label="Date de début"
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              handleFilterChange();
            }}
            className="w-40"
            aria-label="Date de fin"
          />
        </div>

        {(actionFilter !== "all" || startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActionFilter("all");
              setStartDate("");
              setEndDate("");
              setSkip(0);
            }}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Table */}
      <ActivityLogTable logs={data?.logs ?? []} isLoading={isLoading} />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} entrée{total > 1 ? "s" : ""} — page {currentPage} sur {pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={skip === 0}
              onClick={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={skip + PAGE_SIZE >= total}
              onClick={() => setSkip((s) => s + PAGE_SIZE)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
