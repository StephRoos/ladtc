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
import { getMembershipStatusConfig } from "@/components/cards/MembershipCard";
import type { User, Membership } from "@/types";

type MemberRow = User & { membership: Membership | null };

interface MemberTableProps {
  members: MemberRow[];
  onSendReminder?: (memberId: string) => void;
  isLoading?: boolean;
}

/**
 * Sortable, filterable table displaying all club members with their membership info.
 * Actions: view detail, send renewal reminder.
 */
export function MemberTable({
  members,
  onSendReminder,
  isLoading = false,
}: MemberTableProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead>Renouvellement</TableHead>
              <TableHead>Dernier paiement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
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

  if (members.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
        Aucun membre trouvé.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Inscription</TableHead>
            <TableHead>Renouvellement</TableHead>
            <TableHead>Dernier paiement</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const membership = member.membership;
            const statusConfig = membership
              ? getMembershipStatusConfig(membership.status)
              : null;

            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell>
                  {statusConfig && membership ? (
                    <Badge
                      className={cn(
                        "border text-xs",
                        statusConfig.className
                      )}
                    >
                      {statusConfig.label}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {membership
                    ? new Date(membership.joinedAt).toLocaleDateString("fr-BE")
                    : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {membership
                    ? new Date(membership.renewalDate).toLocaleDateString("fr-BE")
                    : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {membership?.paidAt
                    ? new Date(membership.paidAt).toLocaleDateString("fr-BE")
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/members/${member.id}`}>Voir</Link>
                    </Button>
                    {onSendReminder && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSendReminder(member.id)}
                      >
                        Rappel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
