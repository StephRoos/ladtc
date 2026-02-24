"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrder, useUpdateOrder } from "@/hooks/use-orders";
import { orderUpdateSchema, type OrderUpdateFormData } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderStatusConfig } from "@/components/admin/OrderTable";
import type { OrderStatus } from "@/types";

/**
 * Admin order detail page with status update, tracking number, and notes.
 */
export default function AdminOrderDetailPage(): React.ReactNode {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useOrder(id);
  const updateOrder = useUpdateOrder();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderUpdateFormData>({
    resolver: zodResolver(orderUpdateSchema),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data?.order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-muted-foreground">Commande introuvable.</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-primary hover:underline">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const { order } = data;
  const statusConfig = getOrderStatusConfig(order.status as OrderStatus);

  async function onSubmit(formData: OrderUpdateFormData): Promise<void> {
    await updateOrder.mutateAsync({ id, data: formData });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Retour aux commandes
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Commande</h1>
        <Badge className={`border text-xs ${statusConfig.className}`}>
          {statusConfig.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order info */}
        <div className="rounded-md border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Informations</h2>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">ID</dt>
            <dd className="font-mono text-xs">{order.id}</dd>
            <dt className="text-muted-foreground">Date</dt>
            <dd>{new Date(order.createdAt).toLocaleDateString("fr-BE")}</dd>
            <dt className="text-muted-foreground">Membre</dt>
            <dd>{order.user.name ?? order.user.email}</dd>
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-semibold">{order.total.toFixed(2)} €</dd>
            {order.trackingNumber && (
              <>
                <dt className="text-muted-foreground">Suivi</dt>
                <dd className="font-mono">{order.trackingNumber}</dd>
              </>
            )}
          </dl>
        </div>

        {/* Update form */}
        <div className="rounded-md border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Mettre à jour</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {updateOrder.error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {updateOrder.error.message}
              </div>
            )}
            {updateOrder.isSuccess && (
              <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-400">
                Commande mise à jour.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                defaultValue={order.status}
                onValueChange={(v) =>
                  setValue("status", v as OrderUpdateFormData["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                  <SelectItem value="SHIPPED">Expédiée</SelectItem>
                  <SelectItem value="DELIVERED">Livrée</SelectItem>
                  <SelectItem value="CANCELLED">Annulée</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Numéro de suivi</Label>
              <Input
                id="trackingNumber"
                placeholder="ex: BE123456789"
                defaultValue={order.trackingNumber ?? ""}
                {...register("trackingNumber")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Notes internes..."
                defaultValue={order.notes ?? ""}
                {...register("notes")}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || updateOrder.isPending}
              className="w-full"
            >
              {isSubmitting || updateOrder.isPending
                ? "Enregistrement..."
                : "Enregistrer"}
            </Button>
          </form>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-md border border-border p-5">
        <h2 className="mb-4 font-semibold text-foreground">Articles</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.product.name}
                {item.size ? ` (${item.size})` : ""} × {item.quantity}
              </span>
              <span className="font-medium">
                {(item.price * item.quantity).toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-border pt-4 text-sm space-y-1">
          <div className="flex justify-between text-muted-foreground">
            <span>Sous-total</span>
            <span>{order.subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-semibold text-foreground">
            <span>Total</span>
            <span>{order.total.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="mt-6 rounded-md border border-border p-5">
        <h2 className="mb-3 font-semibold text-foreground">Adresse de livraison</h2>
        <address className="not-italic text-sm text-muted-foreground space-y-1">
          <p>{order.shippingName}</p>
          <p>{order.shippingAddress}</p>
          <p>
            {order.shippingZip} {order.shippingCity}
          </p>
          <p>{order.shippingCountry}</p>
          <p>{order.shippingPhone}</p>
          <p>{order.shippingEmail}</p>
        </address>
      </div>
    </div>
  );
}
