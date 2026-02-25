"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateEvent } from "@/hooks/use-events";
import { EventForm } from "@/components/forms/EventForm";
import type { EventFormData } from "@/lib/schemas";

/**
 * Admin create event page.
 */
export default function NewEventPage(): React.ReactNode {
  const router = useRouter();
  const createEvent = useCreateEvent();

  async function handleSubmit(data: EventFormData): Promise<void> {
    await createEvent.mutateAsync(data);
    router.push("/admin/events");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/admin/events"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Retour aux événements
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        Nouvel événement
      </h1>
      <EventForm
        onSubmit={handleSubmit}
        isSubmitting={createEvent.isPending}
        error={createEvent.error?.message}
      />
    </div>
  );
}
