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
import { useDeleteEvent } from "@/hooks/use-events";
import { formatDate } from "@/lib/utils";

interface EventRow {
  id: string;
  title: string;
  date: string;
  location: string;
  type: "TRAINING" | "RACE" | "CAMP" | "SOCIAL";
  maxParticipants: number | null;
  _count: { registrations: number };
}

interface EventTableProps {
  events: EventRow[];
  isLoading?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  TRAINING: "Entraînement",
  RACE: "Course",
  CAMP: "Stage",
  SOCIAL: "Social",
};

const TYPE_COLORS: Record<string, string> = {
  TRAINING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  RACE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  CAMP: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  SOCIAL: "bg-green-500/20 text-green-400 border-green-500/30",
};

/**
 * Events table for admin management with edit and delete actions.
 */
export function EventTable({
  events,
  isLoading = false,
}: EventTableProps): React.ReactNode {
  const deleteEvent = useDeleteEvent();

  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Inscrits</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
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

  if (events.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
        Aucun événement trouvé.
      </div>
    );
  }

  async function handleDelete(id: string, title: string): Promise<void> {
    if (!confirm(`Supprimer l'événement « ${title} » ?`)) return;
    await deleteEvent.mutateAsync(id);
  }

  const isPast = (date: string): boolean => new Date(date) < new Date();

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Lieu</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Inscrits</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event.id}
              className={isPast(event.date) ? "opacity-50" : ""}
            >
              <TableCell className="max-w-[250px] truncate font-medium">
                {event.title}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(event.date)}
              </TableCell>
              <TableCell className="text-sm">{event.location}</TableCell>
              <TableCell>
                <Badge
                  className={`border text-xs ${TYPE_COLORS[event.type] ?? ""}`}
                >
                  {TYPE_LABELS[event.type] ?? event.type}
                </Badge>
              </TableCell>
              <TableCell>
                {event._count.registrations}
                {event.maxParticipants
                  ? ` / ${event.maxParticipants}`
                  : ""}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/events/${event.id}`}>Modifier</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(event.id, event.title)}
                    disabled={deleteEvent.isPending}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
