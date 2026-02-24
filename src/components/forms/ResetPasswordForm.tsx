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
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/schemas";

/**
 * Reset password form component
 * Sends a password reset link to the provided email address
 */
export function ResetPasswordForm(): React.ReactNode {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordFormData): Promise<void> {
    setServerError(null);

    try {
      await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/auth/new-password",
      });
    } catch {
      // We intentionally do not reveal whether the email exists
    }

    // Always show success message to prevent email enumeration
    setSubmitted(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réinitialiser le mot de passe</CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>

      <CardContent>
        {submitted ? (
          <div
            role="status"
            className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400"
          >
            Si un compte existe avec cet email, un lien de réinitialisation a
            été envoyé.
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Envoi en cours..."
                : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
