"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkoutSchema, type CheckoutFormData } from "@/lib/schemas";

interface CheckoutFormProps {
  defaultValues?: Partial<CheckoutFormData>;
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

/**
 * Checkout shipping info form.
 * Uses React Hook Form + Zod validation.
 */
export function CheckoutForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  error,
}: CheckoutFormProps): React.ReactNode {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingCountry: "Belgium",
      ...defaultValues,
    },
  });

  const submitting = isSubmitting || formSubmitting;

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

      <h2 className="text-xl font-semibold text-foreground">Adresse de livraison</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="shippingName">Nom complet</Label>
          <Input
            id="shippingName"
            placeholder="Jean Dupont"
            {...register("shippingName")}
          />
          {errors.shippingName && (
            <p className="text-sm text-destructive">{errors.shippingName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingEmail">Email</Label>
          <Input
            id="shippingEmail"
            type="email"
            placeholder="jean@exemple.be"
            {...register("shippingEmail")}
          />
          {errors.shippingEmail && (
            <p className="text-sm text-destructive">{errors.shippingEmail.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingPhone">Téléphone</Label>
          <Input
            id="shippingPhone"
            type="tel"
            placeholder="+32 499 000 000"
            {...register("shippingPhone")}
          />
          {errors.shippingPhone && (
            <p className="text-sm text-destructive">{errors.shippingPhone.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="shippingAddress">Adresse</Label>
          <Input
            id="shippingAddress"
            placeholder="Rue de l'Exemple 1"
            {...register("shippingAddress")}
          />
          {errors.shippingAddress && (
            <p className="text-sm text-destructive">{errors.shippingAddress.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingCity">Ville</Label>
          <Input
            id="shippingCity"
            placeholder="Bruxelles"
            {...register("shippingCity")}
          />
          {errors.shippingCity && (
            <p className="text-sm text-destructive">{errors.shippingCity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingZip">Code postal</Label>
          <Input
            id="shippingZip"
            placeholder="1000"
            {...register("shippingZip")}
          />
          {errors.shippingZip && (
            <p className="text-sm text-destructive">{errors.shippingZip.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingCountry">Pays</Label>
          <Input
            id="shippingCountry"
            placeholder="Belgium"
            {...register("shippingCountry")}
          />
          {errors.shippingCountry && (
            <p className="text-sm text-destructive">{errors.shippingCountry.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Envoi en cours..." : "Passer la commande"}
      </Button>
    </form>
  );
}
