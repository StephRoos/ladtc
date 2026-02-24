"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData): Promise<void> {
    setServerError(null);
    setSuccessMessage(null);

    const result = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      setServerError(
        result.error.message ??
          "Une erreur est survenue lors de l'inscription. Veuillez réessayer."
      );
      return;
    }

    setSuccessMessage(
      "Un email de vérification a été envoyé à votre adresse. Vérifiez votre boîte de réception."
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Rejoignez la communauté des membres LADTC
        </CardDescription>
      </CardHeader>

      <CardContent>
        {successMessage ? (
          <div
            role="status"
            className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400"
          >
            {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div
                role="alert"
                className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                autoComplete="name"
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
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
