import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
};

/**
 * Login page — email/password authentication form
 */
export default function LoginPage(): React.ReactNode {
  return <LoginForm />;
}
