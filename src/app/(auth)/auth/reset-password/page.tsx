import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
};

/**
 * Reset password page — request a password reset email
 */
export default function ResetPasswordPage(): React.ReactNode {
  return <ResetPasswordForm />;
}
