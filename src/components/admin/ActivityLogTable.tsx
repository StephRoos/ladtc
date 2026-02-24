"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityLogEntry } from "@/types";

interface ActivityLogTableProps {
  logs: ActivityLogEntry[];
  isLoading?: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  MEMBER_UPDATED: "Membre modifié",
  ORDER_SHIPPED: "Commande expédiée",
  ORDER_UPDATED: "Commande mise à jour",
  PRODUCT_CREATED: "Produit créé",
  PRODUCT_UPDATED: "Produit modifié",
  USER_ROLE_UPDATED: "Rôle modifié",
  MEMBER_ADDED: "Membre ajouté",
};

const ACTION_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  MEMBER_UPDATED: "secondary",
  ORDER_SHIPPED: "default",
  ORDER_UPDATED: "secondary",
  PRODUCT_CREATED: "default",
  PRODUCT_UPDATED: "secondary",
  USER_ROLE_UPDATED: "destructive",
  MEMBER_ADDED: "default",
};

/**
 * Format a date to a localised French string.
 */
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("fr-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Table displaying activity log entries with user, action, target, and date.
 */
export function ActivityLogTable({
  logs,
  isLoading,
}: ActivityLogTableProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        Aucun log d&apos;activité
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Cible</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(log.createdAt)}
              </TableCell>
              <TableCell className="text-sm">
                <span className="font-medium">{log.user.name ?? "—"}</span>
                <span className="block text-xs text-muted-foreground">{log.user.email}</span>
              </TableCell>
              <TableCell>
                <Badge variant={ACTION_VARIANTS[log.action] ?? "outline"}>
                  {ACTION_LABELS[log.action] ?? log.action}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {log.target && log.targetId
                  ? `${log.target} #${log.targetId.slice(0, 8)}`
                  : log.target ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
