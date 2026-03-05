"use client";

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
import { memberCreateSchema, type MemberCreateFormData } from "@/lib/schemas";

interface CreateMemberFormProps {
  onSubmit: (data: MemberCreateFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

/**
 * Form for committee/admin to create a new member (user + membership).
 * Uses React Hook Form + Zod validation.
 */
export function CreateMemberForm({
  onSubmit,
  isSubmitting,
  error,
}: CreateMemberFormProps): React.ReactNode {
  const defaultRenewalDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MemberCreateFormData>({
    resolver: zodResolver(memberCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      status: "PENDING",
      renewalDate: defaultRenewalDate,
      paidAt: null,
      amount: 50,
      notes: "",
    },
  });

  const currentStatus = watch("status");

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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Création en cours..." : "Créer le membre"}
      </Button>
    </form>
  );
}
