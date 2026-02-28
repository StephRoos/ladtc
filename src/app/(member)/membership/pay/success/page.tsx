"use client";

import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

/**
 * Membership payment success page.
 */
export default function MembershipPaySuccessPage(): React.ReactNode {
  useRequireAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-green-400"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h1 className="mb-3 text-3xl font-bold text-foreground">Cotisation payée !</h1>
      <p className="mb-8 text-muted-foreground">
        Votre cotisation annuelle a été confirmée. Merci pour votre soutien au club !
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/profile">Mon profil</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}
