import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = {
  title: "Inscription",
};

/**
 * Registration page — create a new LADTC member account
 */
export default function RegisterPage(): React.ReactNode {
  return <RegisterForm />;
}
