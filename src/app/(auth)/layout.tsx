import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Connexion - LADTC",
    template: "%s | LADTC",
  },
};

/**
 * Minimal layout for authentication pages
 * No Header/Footer — focused on the auth form
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <span className="text-3xl font-bold text-primary">LADTC</span>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          Les Amis Du Trail des Collines
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Retour au site
        </Link>
      </p>
    </div>
  );
}
