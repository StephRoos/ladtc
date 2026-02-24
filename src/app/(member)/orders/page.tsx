"use client";

import { useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrderStatusConfig } from "@/components/admin/OrderTable";
import type { OrderStatus } from "@/types";

/**
 * Member orders list page with status filter.
 * Requires authentication.
 */
export default function MemberOrdersPage(): React.ReactNode {
  const { isLoading: authLoading } = useRequireAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOrders({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
  });

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-foreground">Mes commandes</h1>

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
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !data?.orders.length ? (
        <div className="rounded-md border border-border p-10 text-center">
          <p className="text-muted-foreground">Aucune commande trouvée.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/equipment">Découvrir l&apos;équipement</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.orders.map((order) => {
            const statusConfig = getOrderStatusConfig(order.status as OrderStatus);
            return (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-border p-4"
              >
                <div className="space-y-1">
                  <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("fr-BE")} —{" "}
                    {order.items.length} article(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">{order.total.toFixed(2)} €</p>
                  <Badge className={`border text-xs ${statusConfig.className}`}>
                    {statusConfig.label}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/orders/${order.id}`}>Voir</Link>
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {data.pages > 1 && (
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
        </div>
      )}
    </div>
  );
}
