import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { UtcBanner } from "./UtcBanner";
import { UtcSponsorsSection } from "./UtcSponsorsSection";

const utc = siteConfig.utc;

export const metadata: Metadata = {
  title: `${utc.shortName} — L'${utc.name} | ${siteConfig.name}`,
  description: `L'${utc.name}, ${utc.edition}e édition — la course folklorique en binôme organisée par la dtc à Ellezelles. Parcours, règlement et inscriptions.`,
  openGraph: {
    title: `${utc.shortName} — L'${utc.name} | ${siteConfig.name}`,
    description: `L'${utc.name}, ${utc.edition}e édition — parcours, règlement et inscriptions.`,
    url: `${siteConfig.url}/utc`,
    siteName: siteConfig.fullName,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.fullName,
      },
    ],
  },
};

/**
 * Race formats — validated by the committee (meeting of 2026-06-12).
 * Two distinct courses (9 km and 18 km), run in pairs.
 */
const formats = [
  {
    name: "Parcours 9 km",
    detail: "En binôme",
    price: "15 € par binôme",
    description:
      "Un parcours sur les sentiers du Pays des Collines, accessible au plus grand nombre.",
  },
  {
    name: "Parcours 18 km",
    detail: "En binôme",
    price: "25 € par binôme",
    description:
      "Le format long, sur un second parcours distinct, pour les binômes aguerris.",
  },
  {
    name: "Grand Prix « Bellezellesbutte »",
    detail: "Segment montagne chronométré",
    price: "Inclus dans la course",
    description:
      "Le segment montagne emblématique, chronométré sur tapis. Classement individuel hommes et dames, toutes distances confondues.",
  },
];

/**
 * UTC race page — public section for the club's flagship race.
 * Content is driven by `siteConfig.utc` and validated by the committee
 * (meeting of 2026-06-12).
 */



export default function UtcPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Banner illustration (from the gallery) */}
      <UtcBanner />

      {/* Hero */}
      <div className="mb-12 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
          {utc.edition}e édition
        </p>
        <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
          L&apos;{utc.name}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          La course folklorique en binôme et en nocturne organisée par la dtc
          sur les sentiers du Pays des Collines, dans l&apos;ambiance de
          l&apos;Oberbayern : fanfare, costumes et convivialité. Parcours,
          règlement, inscriptions et sponsoring : tout se trouve sur cette
          page.
        </p>
      </div>

      {/* Key info */}
      <section className="mb-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card className="border-border bg-card text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{utc.date ?? "À confirmer"}</p>
              <p className="text-sm text-muted-foreground">
                Course en nocturne
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Lieu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{utc.location}</p>
              <p className="text-sm text-muted-foreground">
                Départ et arrivée à la salle
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Inscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {utc.registrationUrl ? (
                <Button asChild>
                  <a
                    href={utc.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    S&apos;inscrire
                  </a>
                </Button>
              ) : (
                <>
                  <p className="text-lg font-bold text-muted-foreground">
                    Ouverture prochaine
                  </p>
                  <p className="text-sm text-muted-foreground">
                    via Ultratiming
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Formats */}
      <section className="mb-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">Parcours et formules</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {formats.map((format) => (
            <Card key={format.name} className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">{format.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium text-primary">
                  {format.detail}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {format.price}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Nombre d&apos;équipes limité à 150 par distance. Nouveau tracé en
          préparation pour cette édition.
        </p>
      </section>

      {/* Règlement */}
      <section className="mb-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">Règlement</h2>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-start gap-4 pt-6">
            <p className="text-sm text-muted-foreground">
              Le règlement complet de l&apos;{utc.shortName} est disponible sur
              une page dédiée.
            </p>
            <Button variant="outline" asChild>
              <Link href="/utc/reglement">Consulter le règlement</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Sponsoring */}
      <section className="mb-16">

      {/* Nos Sponsors */}
      <UtcSponsorsSection />

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">Devenir sponsor</h2>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              En soutenant l&apos;{utc.shortName}, les entreprises et
              commerçants de la région contribuent au développement
              d&apos;activités sportives dans l&apos;entité et bénéficient
              d&apos;une visibilité adaptée au montant de leur don : logo sur
              écran géant le jour de la course, flyers, page Facebook, site
              internet, inscriptions offertes et enveloppe boissons &amp; food.
            </p>
            <div className="flex flex-wrap gap-2">
              {utc.sponsoring.tiers.map((tier) => (
                <Badge key={tier} variant="secondary" className="text-sm">
                  {tier} €
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Les dons en nature (lots pour les podiums, ravitaillement,
              matériel) sont également les bienvenus et donnent lieu à une
              visibilité en fonction de leur importance.
            </p>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p>
                Versement sur le compte{" "}
                <span className="font-medium text-foreground">
                  {utc.sponsoring.iban}
                </span>{" "}
                avec la communication «&nbsp;{utc.sponsoring.paymentReference}
                &nbsp;». Un reçu cacheté par un membre du comité est remis
                après paiement.
              </p>
              {utc.contactEmail && (
                <p className="mt-2">
                  Contact :{" "}
                  <a
                    href={`mailto:${utc.contactEmail}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {utc.contactEmail}
                  </a>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Registration CTA */}
      <section className="rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">Inscriptions</h2>
        {utc.registrationUrl ? (
          <>
            <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
              Les inscriptions à l&apos;{utc.shortName} sont ouvertes via la
              plateforme Ultratiming.
            </p>
            <Button size="lg" asChild>
              <a
                href={utc.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                S&apos;inscrire à l&apos;{utc.shortName}
              </a>
            </Button>
          </>
        ) : (
          <>
            <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
              Les inscriptions se feront via la plateforme Ultratiming. Le lien
              sera publié ici dès l&apos;ouverture. En attendant, les questions
              peuvent être adressées via la page contact.
            </p>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </>
        )}
      </section>

      {/* Structured data for the race — improves Google indexing and rich
          results for "trail Ellezelles". Inline JSON-LD is the recommended
          pattern for Next.js server components. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: `L'${utc.name} — ${utc.shortName}`,
            description: `Course folklorique en binôme et en nocturne organisée par la dtc sur les sentiers du Pays des Collines, dans l'ambiance de l'Oberbayern.`,
            startDate: "2026-10-24",
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: utc.location,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Ellezelles",
                addressRegion: "Hainaut",
                addressCountry: "BE",
              },
            },
            organizer: {
              "@type": "SportsOrganization",
              name: siteConfig.fullName,
              url: siteConfig.url,
            },
            offers: [
              {
                "@type": "Offer",
                name: "Parcours 9 km (binôme)",
                price: "15.00",
                priceCurrency: "EUR",
                availability: "https://schema.org/PreOrder",
                url: utc.registrationUrl ?? `${siteConfig.url}/utc`,
              },
              {
                "@type": "Offer",
                name: "Parcours 18 km (binôme)",
                price: "25.00",
                priceCurrency: "EUR",
                availability: "https://schema.org/PreOrder",
                url: utc.registrationUrl ?? `${siteConfig.url}/utc`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
