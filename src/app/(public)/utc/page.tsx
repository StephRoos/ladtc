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

const utc = siteConfig.utc;

export const metadata: Metadata = {
  title: `${utc.shortName} — ${utc.name} | ${siteConfig.name}`,
  description: `${utc.name}, ${utc.edition}e édition — la course organisée par la dtc à ${utc.location}. Parcours, règlement et inscriptions.`,
  openGraph: {
    title: `${utc.shortName} — ${utc.name} | ${siteConfig.name}`,
    description: `${utc.name}, ${utc.edition}e édition — parcours, règlement et inscriptions.`,
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
 * Placeholder race formats — structure validated with the committee on
 * 2026-06-12. Distances and elevation figures are drafts, not final values.
 */
const draftFormats = [
  {
    name: "Ultra",
    distance: "Distance à confirmer",
    elevation: "D+ à confirmer",
    description:
      "Le format long de l'épreuve, au cœur du Pays des Collines.",
  },
  {
    name: "Trail",
    distance: "Distance à confirmer",
    elevation: "D+ à confirmer",
    description: "Le format intermédiaire, accessible aux traileurs réguliers.",
  },
  {
    name: "Découverte",
    distance: "Distance à confirmer",
    elevation: "D+ à confirmer",
    description: "Le format court, ouvert au plus grand nombre.",
  },
];

/**
 * Draft regulation skeleton — article structure to be reviewed and completed
 * by the committee before publication.
 */
const draftReglement = [
  {
    title: "Article 1 — Organisation",
    body: `L'${utc.name} (${utc.shortName}) est organisé par la dtc, club de trail running basé à Ellezelles. L'épreuve se déroule sur les sentiers du Pays des Collines.`,
  },
  {
    title: "Article 2 — Inscriptions",
    body: "Conditions d'inscription, tarifs, date limite et modalités de remboursement : à définir par le comité.",
  },
  {
    title: "Article 3 — Parcours et balisage",
    body: "Description des parcours, balisage, barrières horaires et points de contrôle : à définir par le comité.",
  },
  {
    title: "Article 4 — Sécurité et ravitaillements",
    body: "Postes de secours, ravitaillements, matériel obligatoire et conditions d'abandon : à définir par le comité.",
  },
  {
    title: "Article 5 — Assurances et responsabilité",
    body: "Couverture d'assurance de l'organisation et responsabilité des participants : à définir par le comité.",
  },
  {
    title: "Article 6 — Droit à l'image",
    body: "Utilisation des photos et vidéos prises pendant l'épreuve : à définir par le comité.",
  },
  {
    title: "Article 7 — Annulation et force majeure",
    body: "Conditions d'annulation ou de modification de l'épreuve : à définir par le comité.",
  },
];

function DraftBadge(): React.ReactNode {
  return (
    <Badge
      variant="outline"
      className="border-amber-500/50 text-amber-500"
    >
      Projet — à valider par le comité
    </Badge>
  );
}

/**
 * UTC race page — public section for the club's flagship race.
 * Content is driven by `siteConfig.utc`; draft sections are explicitly
 * flagged until the committee validates them.
 */
export default function UtcPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
          {utc.edition}e édition
        </p>
        <h1 className="mb-4 text-4xl font-bold sm:text-5xl">{utc.name}</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          La course organisée par la dtc sur les sentiers du Pays des
          Collines. Parcours, règlement et inscriptions : tout se trouve sur
          cette page.
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
              <p className="text-lg font-bold">
                {utc.date ?? "À confirmer"}
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
                <p className="text-lg font-bold text-muted-foreground">
                  Ouverture prochaine
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Formats */}
      <section className="mb-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">Parcours et formules</h2>
          <DraftBadge />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {draftFormats.map((format) => (
            <Card key={format.name} className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">{format.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium text-primary">
                  {format.distance} · {format.elevation}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Règlement */}
      <section className="mb-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">Règlement</h2>
          <DraftBadge />
        </div>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            {draftReglement.map((article, index) => (
              <div key={article.title}>
                {index > 0 && <Separator className="my-4" />}
                <h3 className="mb-1 font-semibold text-foreground">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground">{article.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Registration CTA */}
      <section className="rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">Inscriptions</h2>
        {utc.registrationUrl ? (
          <>
            <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
              Les inscriptions à l&apos;{utc.shortName} sont ouvertes via notre
              plateforme partenaire.
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
              Le lien d&apos;inscription sera publié ici dès l&apos;ouverture.
              En attendant, les questions peuvent être adressées via la page
              contact.
            </p>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </>
        )}
      </section>
    </div>
  );
}
