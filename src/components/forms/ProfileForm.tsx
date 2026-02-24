"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileUpdateSchema, type ProfileUpdateFormData } from "@/lib/schemas";
import { useUpdateProfile } from "@/hooks/use-member";
import type { User, Membership } from "@/types";

interface ProfileFormProps {
  user: User;
  membership: Membership | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

/**
 * Form for editing a member's own profile (name, phone, emergency contacts).
 * Uses React Hook Form + Zod validation.
 */
export function ProfileForm({
  user,
  membership,
  onCancel,
  onSuccess,
}: ProfileFormProps): React.ReactNode {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name ?? "",
      phone: membership?.phone ?? "",
      emergencyContact: membership?.emergencyContact ?? "",
      emergencyContactPhone: membership?.emergencyContactPhone ?? "",
    },
  });

  async function onSubmit(data: ProfileUpdateFormData): Promise<void> {
    setSuccessMessage(null);
    try {
      await updateProfile.mutateAsync(data);
      setSuccessMessage("Profil mis à jour avec succès.");
      onSuccess?.();
    } catch (err) {
      // error is shown via updateProfile.error
      console.error("[ProfileForm] Update failed:", err);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {updateProfile.error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {updateProfile.error.message}
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
          placeholder="Jean Dupont"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+32 499 000 000"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Contact d&apos;urgence (nom)</Label>
        <Input
          id="emergencyContact"
          type="text"
          placeholder="Marie Dupont"
          {...register("emergencyContact")}
        />
        {errors.emergencyContact && (
          <p className="text-sm text-destructive">
            {errors.emergencyContact.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergencyContactPhone">Contact d&apos;urgence (téléphone)</Label>
        <Input
          id="emergencyContactPhone"
          type="tel"
          placeholder="+32 499 000 001"
          {...register("emergencyContactPhone")}
        />
        {errors.emergencyContactPhone && (
          <p className="text-sm text-destructive">
            {errors.emergencyContactPhone.message}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || updateProfile.isPending}>
          {isSubmitting || updateProfile.isPending ? "Enregistrement..." : "Enregistrer"}
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
