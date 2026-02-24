"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import type { Membership } from "@/types";

interface MemberFormProps {
  memberId: string;
  membership: Membership | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

/**
 * Form for committee/admin to edit a member's membership status, renewal date, and payment info.
 * Uses React Hook Form + Zod validation.
 */
export function MemberForm({
  memberId,
  membership,
  onCancel,
  onSuccess,
}: MemberFormProps): React.ReactNode {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const updateMember = useUpdateMember();

  const defaultRenewalDate = membership?.renewalDate
    ? new Date(membership.renewalDate).toISOString().split("T")[0]
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const defaultPaidAt = membership?.paidAt
    ? new Date(membership.paidAt).toISOString().split("T")[0]
    : "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MemberUpdateFormData>({
    resolver: zodResolver(memberUpdateSchema),
    defaultValues: {
      status: membership?.status ?? "PENDING",
      renewalDate: defaultRenewalDate,
      paidAt: defaultPaidAt || null,
      amount: membership?.amount ?? 50,
      notes: membership?.notes ?? "",
    },
  });

  const currentStatus = watch("status");

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
   * Marks the member as paid with today's date and sets status to ACTIVE.
   */
  function handleMarkAsPaid(): void {
    const today = new Date().toISOString().split("T")[0];
    setValue("paidAt", today);
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
        <Label htmlFor="renewalDate">Date de renouvellement</Label>
        <Input
          id="renewalDate"
          type="date"
          {...register("renewalDate")}
        />
        {errors.renewalDate && (
          <p className="text-sm text-destructive">{errors.renewalDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paidAt">Date de paiement</Label>
        <Input
          id="paidAt"
          type="date"
          {...register("paidAt")}
        />
        {errors.paidAt && (
          <p className="text-sm text-destructive">{errors.paidAt.message}</p>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleMarkAsPaid}
        >
          Marquer comme payé aujourd&apos;hui
        </Button>
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
        <Button type="submit" disabled={isSubmitting || updateMember.isPending}>
          {isSubmitting || updateMember.isPending ? "Enregistrement..." : "Enregistrer"}
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
