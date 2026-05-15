"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface BatchSummary {
  batchId: string;
  status: "BATCHED" | "ORDERED" | "RECEIVED" | "DELIVERED" | "CANCELLED";
  orderCount: number;
  itemCount: number;
  total: number;
  batchedAt: string | null;
  orderedAt: string | null;
  receivedAt: string | null;
  firstOrderAt: string;
}

interface PendingOrder {
  id: string;
  total: number;
  createdAt: string;
  user: { name: string | null; email: string };
  items: Array<{ id: string }>;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  BATCHED: { label: "Groupée", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  ORDERED: { label: "Commandée", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  RECEIVED: { label: "Reçue", className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  DELIVERED: { label: "Livrée", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  CANCELLED: { label: "Annulée", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function AdminBatchesPage(): React.ReactNode {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isGrouping, setIsGrouping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const [batchesRes, pendingRes] = await Promise.all([
        fetch("/api/batches"),
        fetch("/api/orders?status=PENDING"),
      ]);
      if (!batchesRes.ok || !pendingRes.ok) {
        setError("Impossible de charger les lots ou commandes en attente");
        return;
      }
      const batchesBody = (await batchesRes.json()) as { batches: BatchSummary[] };
      const pendingBody = (await pendingRes.json()) as { orders: PendingOrder[] };
      setBatches(batchesBody.batches);
      setPendingOrders(pendingBody.orders);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggle(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGroup(): Promise<void> {
    if (selected.size === 0) return;
    setIsGrouping(true);
    setError(null);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selected) }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Échec du regroupement");
        return;
      }
      setSelected(new Set());
      await load();
    } finally {
      setIsGrouping(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lots d&apos;équipement</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Regrouper les commandes en attente puis piloter les transitions du lot : commande
          fournisseur, réception, livraison.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Pending orders awaiting a batch */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">
            Commandes en attente de regroupement
          </h2>
          <Button
            onClick={handleGroup}
            disabled={selected.size === 0 || isGrouping}
            size="sm"
          >
            {isGrouping
              ? "Création..."
              : `Créer un lot${selected.size > 0 ? ` (${selected.size})` : ""}`}
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : pendingOrders.length === 0 ? (
          <p className="rounded-md border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            Aucune commande en attente.
          </p>
        ) : (
          <div className="rounded-md border border-border">
            {pendingOrders.map((order) => (
              <label
                key={order.id}
                className="flex cursor-pointer items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/30"
              >
                <input
                  type="checkbox"
                  checked={selected.has(order.id)}
                  onChange={() => toggle(order.id)}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {order.user.name ?? order.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} article{order.items.length > 1 ? "s" : ""} —{" "}
                    {order.total.toFixed(2)} €
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("fr-BE")}
                </p>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Détail
                </Link>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Existing batches */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Lots</h2>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : batches.length === 0 ? (
          <p className="rounded-md border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            Aucun lot pour l&apos;instant.
          </p>
        ) : (
          <div className="rounded-md border border-border">
            {batches.map((batch) => {
              const statusConfig =
                STATUS_LABELS[batch.status] ?? {
                  label: batch.status,
                  className: "bg-muted text-muted-foreground",
                };
              return (
                <Link
                  key={batch.batchId}
                  href={`/admin/batches/${batch.batchId}`}
                  className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/30"
                >
                  <div className="flex-1">
                    <p className="font-mono text-sm text-foreground">
                      {batch.batchId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {batch.orderCount} commande{batch.orderCount > 1 ? "s" : ""},{" "}
                      {batch.itemCount} article{batch.itemCount > 1 ? "s" : ""} —{" "}
                      {batch.total.toFixed(2)} €
                    </p>
                  </div>
                  <Badge className={`${statusConfig.className} border text-xs`}>
                    {statusConfig.label}
                  </Badge>
                  <p className="hidden sm:block text-xs text-muted-foreground">
                    {batch.batchedAt
                      ? new Date(batch.batchedAt).toLocaleDateString("fr-BE")
                      : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
