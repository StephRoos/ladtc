"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function useVerifyEmailForm(initialEmail: string) {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/membership/pay",
      });

      if (result.error) {
        setError(result.error.message ?? "Impossible de renvoyer l'email.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return { email, setEmail, sent, error, loading, handleSubmit };
}
