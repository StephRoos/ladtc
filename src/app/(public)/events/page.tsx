"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/cards/EventCard";
import { useEvents } from "@/hooks/use-events";

const PER_PAGE = 9;

const TYPE_FILTERS = [
  { value: undefined, label: "Tous" },
  { value: "TRAINING", label: "Entraînements" },
  { value: "RACE", label: "Courses" },
  { value: "CAMP", label: "Stages" },
  { value: "SOCIAL", label: "Social" },
] as const;

function EventListSkeleton(): React.ReactNode {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PER_PAGE }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-14 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/**
 * Public events listing page — paginated with type filter
 */
export default function EventsPage(): React.ReactNode {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const { data, isLoading, isError } = useEvents(page, PER_PAGE, typeFilter);

  function handleTypeChange(type: string | undefined): void {
    setTypeFilter(type);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Événements</h1>
        <p className="mt-2 text-muted-foreground">
          Découvrez nos prochains événements et inscrivez-vous
        </p>
      </div>

      {/* Type filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            variant={typeFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {isLoading && <EventListSkeleton />}

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
          <p className="font-medium text-destructive">
            Impossible de charger les événements
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Veuillez vérifier votre connexion et réessayer.
          </p>
        </div>
      )}

      {data && (
        <>
          {data.events.length === 0 ? (
            <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
              Aucun événement à venir pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} sur {data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page === data.totalPages}
              >
                Suivant →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
