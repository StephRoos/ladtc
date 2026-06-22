"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SponsorsSection } from "@/components/sponsors/SponsorsSection";
import { usePublicSponsors } from "@/hooks/use-sponsors";

/**
 * Public sponsors page - displays all active sponsors grouped by tier.
 * Features:
 * - Fetches active sponsors from API
 * - Displays sponsors in SponsorsSection component
 * - Loading skeleton states
 * - Error handling
 */
export default function SponsorsPage(): React.ReactNode {
  const { data, isLoading, isError } = usePublicSponsors();

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Nos sponsors</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Découvrez nos partenaires qui nous soutiennent et font partie de
            l&apos;aventure la DTC. Merci à eux pour leur confiance et leur soutien
            continu.
          </p>
        </div>
      </section>

      {/* Sponsors content */}
      {isLoading && (
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="space-y-8">
            {/* Skeleton for each tier */}
            {[
              { tier: "Or", count: 3 },
              { tier: "Argent", count: 4 },
              { tier: "Bronze", count: 5 },
            ].map((tier) => (
              <div key={tier.tier}>
                <div className="mb-6 border-l-4 border-border pl-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="mt-2 h-4 w-20" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: tier.count }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-6 text-center"
                    >
                      <Skeleton className="mb-4 h-20 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="mt-2 h-3 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">Erreur</h2>
          <p className="mt-4 text-muted-foreground">
            Impossible de charger les sponsors pour le moment. Veuillez réessayer
            plus tard.
          </p>
        </div>
      )}

      {data && (
        <SponsorsSection
          sponsors={data.sponsors}
          title="Nos partenaires"
          showTitle={true}
        />
      )}

      {/* Call to action */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Vous voulez nous soutenir ?</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Rejoignez notre communauté de partenaires et bénéficiez d&apos;une
            visibilité auprès de nos membres passionnés. Contactez-nous pour
            discuter des opportunités de partenariat.
          </p>
        </div>
      </section>
    </div>
  );
}
