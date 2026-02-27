"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eventSchema, type EventFormData } from "@/lib/schemas";
import { ImagePicker } from "@/components/admin/ImagePicker";

interface EventFormProps {
  defaultValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  TRAINING: "Entraînement",
  RACE: "Course",
  CAMP: "Stage",
  SOCIAL: "Social",
};

/**
 * Event create/edit form with React Hook Form + Zod validation.
 */
export function EventForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  error,
}: EventFormProps): React.ReactNode {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: "TRAINING",
      ...defaultValues,
      date: defaultValues?.date
        ? new Date(defaultValues.date).toISOString().slice(0, 16)
        : undefined,
      endDate: defaultValues?.endDate
        ? new Date(defaultValues.endDate).toISOString().slice(0, 16)
        : undefined,
    },
  });

  const submitting = isSubmitting || formSubmitting;
  const imageValue = watch("image");

  function handleFormSubmit(data: EventFormData): Promise<void> {
    return onSubmit({
      ...data,
      date: new Date(data.date).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      image: data.image || null,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          placeholder="Entraînement du mercredi"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <textarea
          id="description"
          rows={5}
          placeholder="Décrivez l'événement..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date de début</Label>
          <Input
            id="date"
            type="datetime-local"
            {...register("date")}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin (optionnel)</Label>
          <Input
            id="endDate"
            type="datetime-local"
            {...register("endDate", {
              setValueAs: (v: string) => (v === "" ? null : v),
            })}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Lieu</Label>
          <Input
            id="location"
            placeholder="Place d'Ellezelles"
            {...register("location")}
          />
          {errors.location && (
            <p className="text-sm text-destructive">
              {errors.location.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register("type")}
          >
            {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulté (optionnel)</Label>
          <Input
            id="difficulty"
            placeholder="Facile, Moyen, Difficile..."
            {...register("difficulty")}
          />
          {errors.difficulty && (
            <p className="text-sm text-destructive">
              {errors.difficulty.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Max participants (optionnel)</Label>
          <Input
            id="maxParticipants"
            type="number"
            placeholder="Illimité si vide"
            {...register("maxParticipants", {
              setValueAs: (v: string) => (v === "" ? null : parseInt(v, 10)),
            })}
          />
          {errors.maxParticipants && (
            <p className="text-sm text-destructive">
              {errors.maxParticipants.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Image (optionnel)</Label>
        <ImagePicker
          value={imageValue || undefined}
          onSelect={(url) => setValue("image", url)}
          onClear={() => setValue("image", "")}
        />
        {errors.image && (
          <p className="text-sm text-destructive">{errors.image.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
