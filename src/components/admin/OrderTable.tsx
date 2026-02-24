"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

/**
 * Returns display config (label + className) for an order status badge.
 *
 * @param status - The OrderStatus value
 * @returns Badge label and CSS class names
 */
export function getOrderStatusConfig(status: OrderStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "PENDING":
      return {
        label: "En attente",
        className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      };
    case "CONFIRMED":
      return {
        label: "Confirmée",
        className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      };
    case "SHIPPED":
      return {
        label: "Expédiée",
        className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      };
    case "DELIVERED":
      return {
        label: "Livrée",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
      };
    case "CANCELLED":
      return {
        label: "Annulée",
        className: "bg-red-500/20 text-red-400 border-red-500/30",
      };
    default:
      return { label: status, className: "bg-muted text-muted-foreground" };
  }
}

interface OrderTableProps {
  orders: Order[];
  isLoading?: boolean;
  showMember?: boolean;
}

/**
 * Orders table with status badges and actions.
 * Used in admin orders management page.
 */
export function OrderTable({
  orders,
  isLoading = false,
  showMember = false,
}: OrderTableProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              {showMember && <TableHead>Membre</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: showMember ? 7 : 6 }).map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
        Aucune commande trouvée.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            {showMember && <TableHead>Membre</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusConfig = getOrderStatusConfig(order.status as OrderStatus);
            return (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {order.id.slice(0, 8)}...
                </TableCell>
                {showMember && (
                  <TableCell className="text-sm">
                    {order.user.name ?? order.user.email}
                  </TableCell>
                )}
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("fr-BE")}
                </TableCell>
                <TableCell className="text-sm">
                  {order.items.length} article(s)
                </TableCell>
                <TableCell className="font-semibold">
                  {order.total.toFixed(2)} €
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn("border text-xs", statusConfig.className)}
                  >
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/orders/${order.id}`}>Voir</Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
