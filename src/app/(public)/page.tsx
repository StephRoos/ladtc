"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogGrid } from "@/components/cards/BlogGrid";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import { siteConfig, getRandomDtcMeaning } from "@/config/site";

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
  const [meaning, setMeaning] = useState("");
  useEffect(() => {
    setMeaning(getRandomDtcMeaning());
  }, []);

  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Trail running dans le Pays des Collines"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
          Bienvenue à <span className="text-primary">la DTC</span>
        </h1>
        <p className="mx-auto mb-4 text-xl font-semibold text-foreground">
          Plus qu&apos;un club, une famille
        </p>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground/90">
          Une communauté de passionnés de trail running dans le magnifique Pays
          des Collines, en Belgique. Rejoignez-nous pour nos entraînements et
          événements !
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/contact">Nous rejoindre</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">Nos actualités</Link>
          </Button>
        </div>
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
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  Me
                </span>
                <div>
                  <p className="font-medium">Mercredi à 18:45</p>
                  <p className="text-sm text-muted-foreground">
                    Entraînement by Chichi, notre coach expérimenté
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  Di
                </span>
                <div>
                  <p className="font-medium">Dimanche à 08:45</p>
                  <p className="text-sm text-muted-foreground">
                    Une sortie trail en groupe, pour toutes les allures
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-3xl font-bold">Nous rejoindre</h2>
            <p className="mb-6 text-muted-foreground">
              Que vous soyez débutant ou trail runner expérimenté, la dtc vous
              accueille. Venez nous rencontrer lors d&apos;un entraînement ou
              contactez-nous !
            </p>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/contact">Prendre contact</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Homepage — displays hero, latest blog posts and training info
 */
export default function HomePage(): React.ReactNode {
  return (
    <>
      <HeroSection />
      <LatestBlogSection />
      <TrainingSection />
    </>
  );
}
