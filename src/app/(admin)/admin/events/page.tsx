"use client";

import Link from "next/link";
import { useAdminEvents } from "@/hooks/use-events";
import { EventTable } from "@/components/admin/EventTable";
import { Button } from "@/components/ui/button";

/**
 * Admin events management page.
 */
export default function AdminEventsPage(): React.ReactNode {
  const { data, isLoading, isError } = useAdminEvents();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Événements</h1>
        <Button asChild>
          <Link href="/admin/events/new">Nouvel événement</Link>
        </Button>
      </div>

      {isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-4 text-destructive">
          Impossible de charger les événements.
        </div>
      ) : (
        <EventTable events={data?.events ?? []} isLoading={isLoading} />
      )}
    </div>
  );
}
