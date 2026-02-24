"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogGrid } from "@/components/cards/BlogGrid";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import { siteConfig } from "@/config/site";

function StatsSection(): React.ReactNode {
  return (
    <section className="bg-card py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
          <div>
            <p className="text-5xl font-bold text-primary">
              ~{siteConfig.club.memberCount}
            </p>
            <p className="mt-2 text-muted-foreground">membres actifs</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-primary">
              {new Date().getFullYear() - siteConfig.club.founded}
            </p>
            <p className="mt-2 text-muted-foreground">
              ans d&apos;existence (fondé en {siteConfig.club.founded})
            </p>
          </div>
          <div>
            <p className="text-5xl font-bold text-primary">2</p>
            <p className="mt-2 text-muted-foreground">
              entraînements par semaine
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LatestBlogSection(): React.ReactNode {
  const { data, isLoading, isError } = useBlogPosts(1, 3);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Dernières actualités</h2>
            <p className="mt-2 text-muted-foreground">
              Retrouvez les dernières nouvelles du club
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden text-sm font-medium text-primary hover:underline sm:block"
          >
            Voir tous les articles →
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center text-muted-foreground">
            Impossible de charger les articles pour le moment.
          </p>
        )}

        {data && <BlogGrid posts={data.posts} />}

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/blog">Voir tous les articles</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function HeroSection(): React.ReactNode {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-24">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          🏔️ Trail Running — {siteConfig.club.location}, Belgique
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
          Bienvenue chez{" "}
          <span className="text-primary">LADTC</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Les Amis Du Trail des Collines — une communauté de passionnés de trail
          running dans le magnifique Pays des Collines, en Belgique.
          Rejoignez-nous pour nos entraînements et événements !
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/contact">Nous rejoindre</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">Nos actualités</Link>
          </Button>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>
    </section>
  );
}

function TrainingSection(): React.ReactNode {
  return (
    <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-bold">Nos entraînements</h2>
            <p className="mb-6 text-muted-foreground">
              Chaque semaine, deux rendez-vous pour courir ensemble dans les
              magnifiques sentiers du Pays des Collines.
            </p>
            <ul className="space-y-3">
              {siteConfig.schedule.training.map((session) => (
                <li key={session.day} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {session.day === "Wednesday" ? "Me" : "Di"}
                  </span>
                  <span className="font-medium">
                    {session.day === "Wednesday" ? "Mercredi" : "Dimanche"} à{" "}
                    {session.time}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    — {session.location}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-3xl font-bold">Nous rejoindre</h2>
            <p className="mb-6 text-muted-foreground">
              Que vous soyez débutant ou trail runner expérimenté, le LADTC vous
              accueille. Venez nous rencontrer lors d&apos;un entraînement ou
              contactez-nous !
            </p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/contact">Prendre contact</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Homepage — displays hero, stats, latest blog posts and training info
 */
export default function HomePage(): React.ReactNode {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <LatestBlogSection />
      <TrainingSection />
    </>
  );
}
