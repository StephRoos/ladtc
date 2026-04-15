import type { Metadata } from "next";
import { Suspense } from "react";
import { NewPasswordForm } from "@/components/forms/NewPasswordForm";

export const metadata: Metadata = {
  title: "Définir un nouveau mot de passe",
};

/**
 * New password page — reached via the link in the password reset email.
 * BetterAuth redirects here with a `?token=` query param after validating the reset link.
 */
export default function NewPasswordPage(): React.ReactNode {
  return (
    <Suspense fallback={null}>
      <NewPasswordForm />
    </Suspense>
  );
}
