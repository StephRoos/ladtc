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
 * Race formats — based on the UTC 3 formula (2025). Prices and details are
 * carried over from the previous edition until the committee validates the
 * 2026 values (meeting of 2026-06-12).
 */
const draftFormats = [
  {
    name: "1 boucle — 9 km",
    detail: "En binôme",
    price: "12 € par binôme (tarif UTC 3, à confirmer)",
    description:
      "Une boucle sur les sentiers du Pays des Collines, accessible au plus grand nombre.",
  },
  {
    name: "2 boucles — 18 km",
    detail: "En binôme",
    price: "20 € par binôme (tarif UTC 3, à confirmer)",
    description:
      "Le format long : deux passages sur la boucle, pour les binômes aguerris.",
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
 * Draft regulation — structure and known facts from UTC 3, to be reviewed
 * and completed by the committee before publication.
 */
const draftReglement = [
  {
    title: "Article 1 — Organisation",
    body: `L'${utc.name} (${utc.shortName}) est organisé par la dtc, club de trail running d'Ellezelles, le ${utc.date?.toLowerCase() ?? "(date à confirmer)"}. Course en nocturne : lampe frontale obligatoire. Départ et arrivée sur le site de l'école communale d'Ellezelles. Course folklorique sur le thème de l'Oberbayern : fanfare, costumes et restauration typique.`,
  },
  {
    title: "Article 2 — Formule de course",
    body: "Course en binôme. Deux distances : 1 boucle (9 km) ou 2 boucles (18 km). Nombre d'équipes limité à 150 par distance. Détails du tracé : à valider par le comité (nouveau parcours à soumettre à la commune).",
  },
  {
    title: "Article 3 — Inscriptions",
    body: "Inscriptions en ligne via la plateforme Ultratiming. Tarifs, date d'ouverture et modalités de remboursement : à confirmer par le comité.",
  },
  {
    title: "Article 4 — Grand Prix « Bellezellesbutte »",
    body: "Segment montagne chronométré sur tapis (départ et arrivée du segment). Classement individuel : 3 meilleurs hommes et 3 meilleures dames, toutes distances confondues.",
  },
  {
    title: "Article 5 — Ravitaillements et sécurité",
    body: "Un ravitaillement durant la course (boissons et oranges) et un ravitaillement complet à l'arrivée, avec soupe d'après-course. Dispositif de sécurité : à détailler par le comité.",
  },
  {
    title: "Article 6 — Podiums et récompenses",
    body: "Par distance : podium hommes, podium mixte et podium dames. Grand Prix Montagne : 3 meilleurs hommes et 3 meilleures dames. Maillots distinctifs pour les vainqueurs (maillot jaune par catégorie, maillot à pois pour le Grand Prix) : à confirmer pour cette édition.",
  },
  {
    title: "Article 7 — Assurances et responsabilité",
    body: "L'épreuve est couverte par une assurance événement. Chaque participant court sous sa propre responsabilité et déclare être apte à la pratique de la course à pied.",
  },
  {
    title: "Article 8 — Droit à l'image",
    body: "Utilisation des photos et vidéos prises pendant l'épreuve : à définir par le comité.",
  },
  {
    title: "Article 9 — Annulation et force majeure",
    body: "Conditions d'annulation ou de modification de l'épreuve : à définir par le comité.",
  },
];

function DraftBadge(): React.ReactNode {
  return (
    <Badge variant="outline" className="border-amber-500/50 text-amber-500">
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
                Départ et arrivée sur le site de l&apos;école
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

      {/* Sponsoring */}
      <section className="mb-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">Devenir sponsor</h2>
          <DraftBadge />
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
    </div>
  );
}
