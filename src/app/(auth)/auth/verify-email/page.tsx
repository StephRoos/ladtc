"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerifyEmailForm } from "./useVerifyEmailForm";

function VerifyEmailForm(): React.ReactNode {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";
  const { email, setEmail, sent, error, loading, handleSubmit } = useVerifyEmailForm(emailFromQuery);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Vérifiez votre adresse email</CardTitle>
        <CardDescription>
          Un email de confirmation vous a été envoyé. Cliquez sur le lien qu&apos;il
          contient pour activer votre compte.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          {sent && (
            <div className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-400">
              Email de vérification renvoyé.
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            type="submit"
            disabled={loading || sent}
          >
            {loading ? "Envoi en cours..." : sent ? "Email renvoyé" : "Renvoyer l'email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Email verification page.
 * Shown after sign-up or when an unverified user tries to log in.
 */
export default function VerifyEmailPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Suspense
        fallback={
          <Card>
            <CardHeader className="text-center">
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
