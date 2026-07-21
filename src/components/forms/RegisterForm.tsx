"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUp } from "@/lib/auth-client";
import { registerSchema, type RegisterFormData } from "@/lib/schemas";

/**
 * Registration form component with name, email, password, and confirm password fields
 */
export function RegisterForm(): React.ReactNode {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData): Promise<void> {
    setServerError(null);

    // Concatenate first and last name into a single "name" string stored by
    // BetterAuth. Splitting the input into two fields prevents the first/last
    // name ordering ambiguity that previously produced malformed entries on
    // the /team page (e.g. "Carton-Delcourt Bruno" instead of "Bruno
    // Carton-Delcourt").
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    const result = await signUp.email({
      name: fullName,
      email: data.email,
      password: data.password,
      callbackURL: "/membership/pay",
    });

    if (result.error) {
      setServerError(
        result.error.message ??
          "Une erreur est survenue lors de l'inscription. Veuillez réessayer."
      );
      return;
    }

    // Redirect to email verification page. Email verification is now required
    // before the user can log in or pay for membership.
    router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    return;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devenir membre</CardTitle>
        <CardDescription>
          Créer un compte pour rejoindre le club et accéder à
          l&apos;espace membre
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {serverError}
            </div>
          )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  autoComplete="given-name"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  autoComplete="family-name"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("password")}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 caractères
              </p>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            Se connecter
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          Une question ?{" "}
          <Link
            href="/contact"
            className="font-medium text-primary hover:underline"
          >
            Formulaire de contact
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
