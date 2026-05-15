"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface BatchOrder {
  id: string;
  status: string;
  total: number;
  deliveryMethod: "HOME_DELIVERY" | "CLUB_PICKUP";
  paidAt: string | null;
  user: { id: string; name: string | null; email: string };
  items: Array<{
    id: string;
    quantity: number;
    size: string | null;
    price: number;
    product: { id: string; name: string };
  }>;
}

interface BatchDetail {
  batchId: string;
  orders: BatchOrder[];
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  BATCHED: { label: "Groupée", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  ORDERED: { label: "Commandée", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  RECEIVED: { label: "Reçue", className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  DELIVERED: { label: "Livrée", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  CANCELLED: { label: "Annulée", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

interface SurplusKey {
  productId: string;
  productName: string;
  size: string;
}

export default function BatchDetailPage(): React.ReactNode {
  const { batchId } = useParams<{ batchId: string }>();
  const router = useRouter();
  const [data, setData] = useState<BatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [showSurplus, setShowSurplus] = useState(false);
  const [surplus, setSurplus] = useState<Record<string, string>>({});

  async function load(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/batches/${batchId}`);
      if (!res.ok) {
        setError("Lot introuvable");
        return;
      }
      const body = (await res.json()) as BatchDetail;
      setData(body);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (batchId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  // Derived: the batch status is the common status across orders; if anything
  // diverges we surface "Mixte" so the admin notices an inconsistency.
  const batchStatus = useMemo(() => {
    if (!data || data.orders.length === 0) return "—";
    const statuses = new Set(data.orders.map((o) => o.status));
    return statuses.size === 1 ? data.orders[0].status : "MIXED";
  }, [data]);

  // Derived: distinct (product, size) pairs in the batch, used to seed the
  // surplus form. Admin can add extra rows manually but the common case is
  // surplus on items that were already part of the batch.
  const surplusKeys: SurplusKey[] = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, SurplusKey>();
    for (const order of data.orders) {
      for (const item of order.items) {
        if (!item.size) continue;
        const key = `${item.product.id}|${item.size}`;
        if (!map.has(key)) {
          map.set(key, {
            productId: item.product.id,
            productName: item.product.name,
            size: item.size,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [data]);

  async function transition(
    target: "ORDERED" | "RECEIVED",
    surplusPayload?: Array<{ productId: string; size: string; quantity: number }>
  ): Promise<void> {
    setIsActing(true);
    setError(null);
    try {
      const res = await fetch(`/api/batches/${batchId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target, surplus: surplusPayload }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Échec de la transition");
        return;
      }
      setShowSurplus(false);
      setSurplus({});
      await load();
    } finally {
      setIsActing(false);
    }
  }

  async function callAction(
    path: "ungroup" | "cancel",
    confirmMsg: string,
    redirectAfter: boolean
  ): Promise<void> {
    if (!window.confirm(confirmMsg)) return;
    setIsActing(true);
    setError(null);
    try {
      const res = await fetch(`/api/batches/${batchId}/${path}`, { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Échec de l'action");
        setIsActing(false);
        return;
      }
      if (redirectAfter) {
        router.push("/admin/batches");
      } else {
        await load();
        setIsActing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'action");
      setIsActing(false);
    }
  }

  function handleReceiveClick(): void {
    setShowSurplus(true);
    const initial: Record<string, string> = {};
    for (const key of surplusKeys) {
      initial[`${key.productId}|${key.size}`] = "0";
    }
    setSurplus(initial);
  }

  async function handleReceiveSubmit(): Promise<void> {
    const payload: Array<{ productId: string; size: string; quantity: number }> = [];
    for (const key of surplusKeys) {
      const raw = surplus[`${key.productId}|${key.size}`] ?? "0";
      const value = Number(raw);
      if (!Number.isInteger(value) || value < 0) {
        setError(`Surplus invalide pour ${key.productName} (${key.size})`);
        return;
      }
      if (value > 0) {
        payload.push({ productId: key.productId, size: key.size, quantity: value });
      }
    }
    await transition("RECEIVED", payload.length > 0 ? payload : undefined);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-muted-foreground">{error ?? "Lot introuvable"}</p>
        <Link href="/admin/batches" className="mt-4 inline-block text-primary hover:underline">
          Retour aux lots
        </Link>
      </div>
    );
  }

  const statusConfig =
    STATUS_LABELS[batchStatus] ?? {
      label: batchStatus,
      className: "bg-muted text-muted-foreground",
    };
  const totalAmount = data.orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div>
        <Link
          href="/admin/batches"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          ← Retour aux lots
        </Link>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">
            Lot <span className="font-mono text-xl text-muted-foreground">{batchId.slice(0, 8)}</span>
          </h1>
          <Badge className={`${statusConfig.className} border`}>{statusConfig.label}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {data.orders.length} commande{data.orders.length > 1 ? "s" : ""} —{" "}
          {totalAmount.toFixed(2)} € au total
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Transition actions */}
      <section className="rounded-md border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground">Actions</h2>
        {batchStatus === "BATCHED" && (
          <>
            <p className="text-sm text-muted-foreground">
              Le lot a été regroupé. Quand la commande a été passée chez le fournisseur,
              cliquer ci-dessous.
            </p>
            <Button onClick={() => transition("ORDERED")} disabled={isActing}>
              {isActing ? "..." : "Marquer commandée"}
            </Button>
          </>
        )}

        {batchStatus === "ORDERED" && !showSurplus && (
          <>
            <p className="text-sm text-muted-foreground">
              Quand le lot arrive du fournisseur, cliquer ci-dessous. Un formulaire permettra de
              renseigner les éventuels surplus à ajouter au stock.
            </p>
            <Button onClick={handleReceiveClick} disabled={isActing}>
              Marquer reçue…
            </Button>
          </>
        )}

        {batchStatus === "ORDERED" && showSurplus && (
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Surplus reçus en plus des commandes membres (laisser à 0 si aucun surplus).
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {surplusKeys.map((key) => {
                const k = `${key.productId}|${key.size}`;
                return (
                  <div key={k} className="space-y-1">
                    <Label htmlFor={`surplus-${k}`}>
                      {key.productName} — taille {key.size}
                    </Label>
                    <Input
                      id={`surplus-${k}`}
                      type="number"
                      min="0"
                      step="1"
                      value={surplus[k] ?? "0"}
                      onChange={(e) =>
                        setSurplus((prev) => ({ ...prev, [k]: e.target.value }))
                      }
                      disabled={isActing}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Button onClick={handleReceiveSubmit} disabled={isActing}>
                {isActing ? "..." : "Confirmer réception"}
              </Button>
              <Button variant="outline" onClick={() => setShowSurplus(false)} disabled={isActing}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        {batchStatus === "RECEIVED" && (
          <p className="text-sm text-muted-foreground">
            Lot reçu. Les membres ont été notifiés par email pour régler leur commande. Marquer
            chaque commande comme livrée individuellement quand elle est remise au membre.
          </p>
        )}

        {batchStatus === "DELIVERED" && (
          <p className="text-sm text-muted-foreground">Toutes les commandes ont été livrées.</p>
        )}

        {batchStatus === "MIXED" && (
          <p className="text-sm text-destructive">
            Les commandes de ce lot ont des statuts différents — vérifier individuellement.
          </p>
        )}
      </section>

      {/* Danger zone — ungroup / cancel the whole batch */}
      <section className="rounded-md border border-destructive/30 bg-destructive/5 p-5 space-y-3">
        <h2 className="font-semibold text-foreground">Actions destructives</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            disabled={batchStatus !== "BATCHED" || isActing}
            onClick={() =>
              callAction(
                "ungroup",
                `Dégrouper le lot ? Toutes les commandes (${data.orders.length}) repassent en PENDING.`,
                true
              )
            }
            title={
              batchStatus !== "BATCHED"
                ? "Dégroupage uniquement disponible tant que le lot n'a pas été commandé"
                : undefined
            }
          >
            Dégrouper le lot
          </Button>
          <Button
            variant="destructive"
            disabled={
              isActing || batchStatus === "CANCELLED" || batchStatus === "DELIVERED"
            }
            onClick={() =>
              callAction(
                "cancel",
                `Annuler l'intégralité du lot ? Toutes les commandes (${data.orders.length}) passent en CANCELLED. Les remboursements éventuels sont à gérer manuellement via Stripe.`,
                false
              )
            }
          >
            Annuler le lot entier
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Le dégroupage est possible uniquement tant que le lot n&apos;a pas été commandé
          chez le fournisseur. L&apos;annulation du lot bascule chaque commande en CANCELLED
          sans toucher au stock — les commandes payées resteront marquées comme telles, les
          remboursements éventuels sont à effectuer manuellement via Stripe.
        </p>
      </section>

      {/* Orders in the batch */}
      <section className="space-y-3">
        <h2 className="font-semibold text-foreground">Commandes du lot</h2>
        <div className="rounded-md border border-border">
          {data.orders.map((order) => {
            const orderStatus =
              STATUS_LABELS[order.status] ?? {
                label: order.status,
                className: "bg-muted text-muted-foreground",
              };
            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/30"
                onClick={() => router.prefetch(`/admin/orders/${order.id}`)}
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {order.user.name ?? order.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} article{order.items.length > 1 ? "s" : ""} —{" "}
                    {order.total.toFixed(2)} €
                    {order.deliveryMethod === "CLUB_PICKUP" ? " — retrait club" : " — livraison"}
                  </p>
                </div>
                <Badge className={`${orderStatus.className} border text-xs`}>
                  {orderStatus.label}
                </Badge>
                <span
                  className={`text-xs ${
                    order.paidAt ? "text-green-500" : "text-muted-foreground"
                  }`}
                >
                  {order.paidAt ? "Payée" : "Impayée"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
