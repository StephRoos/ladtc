"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { OrderTable } from "@/components/admin/OrderTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Admin orders management page with status filters.
 */
export default function AdminOrdersPage(): React.ReactNode {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useOrders({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-foreground">Commandes</h1>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filtrer par statut :</span>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="CONFIRMED">Confirmée</SelectItem>
            <SelectItem value="SHIPPED">Expédiée</SelectItem>
            <SelectItem value="DELIVERED">Livrée</SelectItem>
            <SelectItem value="CANCELLED">Annulée</SelectItem>
          </SelectContent>
        </Select>
        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} commande(s)
          </span>
        )}
      </div>

      {isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-4 text-destructive">
          Impossible de charger les commandes.
        </div>
      ) : (
        <>
          <OrderTable
            orders={data?.orders ?? []}
            isLoading={isLoading}
            showMember
          />

          {data && data.pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                Page {page} / {data.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pages}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
