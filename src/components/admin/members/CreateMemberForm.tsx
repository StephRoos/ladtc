"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { memberCreateSchema, type MemberCreateFormData } from "@/lib/schemas";
import { getCurrentSeason } from "@/lib/membership";
import { MEMBERSHIP_DUES_NET } from "@/lib/membership-fees";

interface CreateMemberFormProps {
  onSubmit: (data: MemberCreateFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

/**
 * Form for committee/admin to create a new member (user + membership).
 */
export function CreateMemberForm({
  onSubmit,
  isSubmitting,
  error,
}: CreateMemberFormProps): React.ReactNode {
  const currentSeason = getCurrentSeason();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<MemberCreateFormData>({
    resolver: zodResolver(memberCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      status: "PENDING",
      season: null,
      paidAt: null,
      amount: MEMBERSHIP_DUES_NET,
      notes: "",
    },
  });

  const currentStatus = useWatch({ control, name: "status" });

  /**
   * Marks the member as paid for the current season.
   */
  function handleMarkAsPaid(): void {
    const today = new Date().toISOString().split("T")[0];
    setValue("paidAt", today);
    setValue("season", currentSeason);
    setValue("status", "ACTIVE");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          type="text"
          placeholder="Jean Dupont"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="jean@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Statut</Label>
        <Select
          value={currentStatus}
          onValueChange={(value) =>
            setValue("status", value as MemberCreateFormData["status"])
          }
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Choisir un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="INACTIVE">Inactif</SelectItem>
            <SelectItem value="EXPIRED">Expiré</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="season">Saison</Label>
        <Input
          id="season"
          type="text"
          placeholder={currentSeason}
          {...register("season")}
        />
        <p className="text-xs text-muted-foreground">
          Format : AAAA-AAAA (ex. {currentSeason}). Laisser vide si pas encore payé.
        </p>
        {errors.season && (
          <p className="text-sm text-destructive">{errors.season.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Montant (EUR)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes internes</Label>
        <Input
          id="notes"
          type="text"
          placeholder="Notes visibles uniquement par le bureau"
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Création en cours..." : "Créer le membre"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleMarkAsPaid}
        >
          Payé pour {currentSeason}
        </Button>
      </div>
    </form>
  );
}
