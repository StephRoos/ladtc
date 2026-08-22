"use client";

import { useState } from "react";
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
import { memberUpdateSchema, type MemberUpdateFormData } from "@/lib/schemas";
import { useUpdateMember } from "@/hooks/use-members";
import { getCurrentSeason } from "@/lib/membership";
import { MEMBERSHIP_DUES_NET } from "@/lib/membership-fees";
import type { Membership, User } from "@/types";

interface MemberFormProps {
  memberId: string;
  user: User;
  membership: Membership | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

/**
 * Form for committee/admin to edit a member's membership status and season.
 */
export function MemberForm({
  memberId,
  user,
  membership,
  onCancel,
  onSuccess,
}: MemberFormProps): React.ReactNode {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const updateMember = useUpdateMember();
  const currentSeason = getCurrentSeason();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MemberUpdateFormData>({
    resolver: zodResolver(memberUpdateSchema),
    defaultValues: {
      name: user.name ?? "",
      status: membership?.status ?? "PENDING",
      season: membership?.season ?? null,
      paidAt: membership?.paidAt
        ? new Date(membership.paidAt).toISOString().split("T")[0]
        : null,
      amount: membership?.amount ?? MEMBERSHIP_DUES_NET,
      notes: membership?.notes ?? "",
      joinedYear: membership?.joinedAt
        ? new Date(membership.joinedAt).getFullYear()
        : new Date().getFullYear(),
    },
  });

  const currentStatus = useWatch({ control, name: "status" });

  async function onSubmit(data: MemberUpdateFormData): Promise<void> {
    setSuccessMessage(null);
    try {
      await updateMember.mutateAsync({ id: memberId, data });
      setSuccessMessage("Cotisation mise à jour avec succès.");
      onSuccess?.();
    } catch (err) {
      console.error("[MemberForm] Update failed:", err);
    }
  }

  /**
   * Marks the member as paid for the current season with today's date.
   */
  function handleMarkAsPaid(): void {
    const today = new Date().toISOString().split("T")[0];
    setValue("paidAt", today);
    setValue("season", currentSeason);
    setValue("status", "ACTIVE");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {updateMember.error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {updateMember.error.message}
        </div>
      )}
      {successMessage && (
        <div
          role="status"
          className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-400"
        >
          {successMessage}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          type="text"
          placeholder="Prénom Nom"
          {...register("name")}
        />
        <p className="text-xs text-muted-foreground">
          Format : « Prénom Nom » (dans cet ordre). Permet de corriger un nom
          mal saisi ou inversé.
        </p>
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Statut</Label>
        <Select
          value={currentStatus}
          onValueChange={(value) =>
            setValue("status", value as MemberUpdateFormData["status"])
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
          Format : AAAA-AAAA (ex. {currentSeason}). Saison en cours : {currentSeason}
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
        <Label htmlFor="joinedYear">Membre depuis (année)</Label>
        <Input
          id="joinedYear"
          type="number"
          step="1"
          min="2000"
          max="2100"
          placeholder="2025"
          {...register("joinedYear", { valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          Année d&apos;adhésion au club. Affichée sur le profil du membre.
        </p>
        {errors.joinedYear && (
          <p className="text-sm text-destructive">{errors.joinedYear.message}</p>
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
        <Button type="submit" disabled={isSubmitting || updateMember.isPending}>
          {isSubmitting || updateMember.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleMarkAsPaid}
        >
          Payé pour {currentSeason}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}
