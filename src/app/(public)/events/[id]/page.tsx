"use client";

import Link from "next/link";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { useEvent, useRegisterEvent, useUnregisterEvent } from "@/hooks/use-events";
import { useSession } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  TRAINING: "Entraînement",
  RACE: "Course",
  CAMP: "Stage",
  SOCIAL: "Social",
};

const TYPE_COLORS: Record<string, string> = {
  TRAINING: "bg-blue-500/10 text-blue-400",
  RACE: "bg-orange-500/10 text-orange-400",
  CAMP: "bg-purple-500/10 text-purple-400",
  SOCIAL: "bg-green-500/10 text-green-400",
};

function EventSkeleton(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

/**
 * Single event detail page with registration button
 */
export default function EventDetailPage({
  params,
}: EventDetailPageProps): React.ReactNode {
  const { id } = use(params);
  const { data, isLoading, isError } = useEvent(id);
  const { data: session } = useSession();
  const registerEvent = useRegisterEvent();
  const unregisterEvent = useUnregisterEvent();

  const event = data?.event;
  const isLoggedIn = !!session?.user;
  const userId = session?.user?.id;

  const isRegistered =
    event?.registrations.some((r) => r.userId === userId) ?? false;

  const spotsLeft = event?.maxParticipants
    ? event.maxParticipants - event._count.registrations
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isPast = event ? new Date(event.date) < new Date() : false;

  async function handleRegister(): Promise<void> {
    await registerEvent.mutateAsync(id);
  }

  async function handleUnregister(): Promise<void> {
    await unregisterEvent.mutateAsync(id);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Button asChild variant="ghost" className="-ml-4 mb-8">
        <Link href="/events">← Retour aux événements</Link>
      </Button>

      {isLoading && <EventSkeleton />}

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
          <p className="font-medium text-destructive">
            Impossible de charger l&apos;événement
          </p>
        </div>
      )}

      {event && (
        <div>
          {/* Type badge */}
          <div className="mb-4">
            <Badge
              variant="secondary"
              className={TYPE_COLORS[event.type] ?? ""}
            >
              {TYPE_LABELS[event.type] ?? event.type}
            </Badge>
            {event.difficulty && (
              <Badge variant="outline" className="ml-2 text-xs">
                {event.difficulty}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            {event.title}
          </h1>

          {/* Meta */}
          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDate(event.date)} à{" "}
              {new Date(event.date).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {event.location}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {event._count.registrations} inscrit
              {event._count.registrations !== 1 ? "s" : ""}
              {spotsLeft !== null &&
                ` (${spotsLeft} place${spotsLeft !== 1 ? "s" : ""} restante${spotsLeft !== 1 ? "s" : ""})`}
            </span>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-8 rounded-lg border border-border bg-card p-6">
              <p className="whitespace-pre-wrap text-foreground">
                {event.description}
              </p>
            </div>
          )}

          {/* Registration button */}
          {!isPast && (
            <div className="mb-8 rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-bold">Inscription</h2>

              {!isLoggedIn ? (
                <div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Connectez-vous pour vous inscrire à cet événement.
                  </p>
                  <Button asChild>
                    <Link href={`/auth/login?callbackUrl=/events/${id}`}>
                      Se connecter
                    </Link>
                  </Button>
                </div>
              ) : isRegistered ? (
                <div>
                  <p className="mb-3 text-sm text-green-400">
                    Vous êtes inscrit à cet événement.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleUnregister}
                    disabled={unregisterEvent.isPending}
                  >
                    {unregisterEvent.isPending
                      ? "Désinscription..."
                      : "Se désinscrire"}
                  </Button>
                </div>
              ) : isFull ? (
                <p className="text-sm text-orange-400">
                  Cet événement est complet.
                </p>
              ) : (
                <Button
                  onClick={handleRegister}
                  disabled={registerEvent.isPending}
                >
                  {registerEvent.isPending
                    ? "Inscription..."
                    : "S'inscrire"}
                </Button>
              )}

              {registerEvent.error && (
                <p className="mt-2 text-sm text-destructive">
                  {registerEvent.error.message}
                </p>
              )}
              {unregisterEvent.error && (
                <p className="mt-2 text-sm text-destructive">
                  {unregisterEvent.error.message}
                </p>
              )}
            </div>
          )}

          {isPast && (
            <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6 text-center text-muted-foreground">
              Cet événement est passé.
            </div>
          )}

          {/* Participants list */}
          {event.registrations.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-bold">
                Participants ({event._count.registrations})
              </h2>
              <div className="flex flex-wrap gap-2">
                {event.registrations.map((reg) => (
                  <Badge key={reg.id} variant="outline" className="text-sm">
                    {reg.user.name ?? "Membre"}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
