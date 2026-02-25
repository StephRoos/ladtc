"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEvent, useUpdateEvent } from "@/hooks/use-events";
import { EventForm } from "@/components/forms/EventForm";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventFormData } from "@/lib/schemas";

/**
 * Admin edit event page.
 */
export default function EditEventPage(): React.ReactNode {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useEvent(id);
  const updateEvent = useUpdateEvent();

  async function handleSubmit(formData: EventFormData): Promise<void> {
    await updateEvent.mutateAsync({ id, data: formData });
    router.push("/admin/events");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data?.event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-muted-foreground">Événement introuvable.</p>
        <Link
          href="/admin/events"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Retour aux événements
        </Link>
      </div>
    );
  }

  const { event } = data;
  const defaultValues: EventFormData = {
    title: event.title,
    description: event.description ?? undefined,
    date: event.date,
    location: event.location,
    type: event.type,
    difficulty: event.difficulty ?? undefined,
    maxParticipants: event.maxParticipants,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/admin/events"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Retour aux événements
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        Modifier l&apos;événement
      </h1>
      <EventForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={updateEvent.isPending}
        error={updateEvent.error?.message}
      />
    </div>
  );
}
