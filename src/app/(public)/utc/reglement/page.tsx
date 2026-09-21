import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Euro,
  Flashlight,
  MapPin,
  Phone,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { siteConfig } from "@/config/site";

const utc = siteConfig.utc;

export const metadata: Metadata = {
  title: `Règlement — L'${utc.name}`,
  description: `Règlement officiel de l'${utc.name} (${utc.shortName}) : épreuves, inscriptions, parcours, sécurité et droit à l'image.`,
};

type Block =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | {
      kind: "note";
      icon: LucideIcon;
      tone?: "info" | "warning";
      text: string;
    }
  | { kind: "tel" };

type ArticleData = { num: number; title: string; blocks: Block[] };

const keyInfo: { icon: LucideIcon; label: string; value: string; detail: string }[] = [
  {
    icon: Calendar,
    label: "Date",
    value: "Samedi 24 octobre 2026",
    detail: "Secrétariat dès 17h00",
  },
  {
    icon: Clock,
    label: "Départs",
    value: "18 km : 18h00 · 9 km : 18h30",
    detail: "Course en nocturne",
  },
  {
    icon: MapPin,
    label: "Lieu",
    value: "Salle du CACS",
    detail: "Place 11, Ellezelles",
  },
  {
    icon: Users,
    label: "Format",
    value: "Course en binôme",
    detail: "600 participants max, toutes épreuves",
  },
  {
    icon: Euro,
    label: "Tarifs",
    value: "15 € (9 km) · 25 € (18 km)",
    detail: "Par binôme, +3 € sur place",
  },
  {
    icon: Flashlight,
    label: "Nocturne",
    value: "Lampe frontale obligatoire",
    detail: "Pour tous les participants",
  },
];

const telContacts = [
  { name: "Mathieu", phone: "0497/12 47 64", tel: "+32497124764" },
  { name: "Maxime", phone: "0478/76 99 27", tel: "+32478769927" },
];

const articles: ArticleData[] = [
  {
    num: 1,
    title: "Notre esprit",
    blocks: [
      {
        kind: "p",
        text: "L'esprit promu par notre club, la dtc, consiste à « courir pour le plaisir, en toute convivialité, dans le respect de chacun et de la nature ».",
      },
      {
        kind: "p",
        text: "En tant qu'association de fait, nous ne recherchons aucun but lucratif, sinon celui d'apporter une activité sportive à notre belle région des Collines.",
      },
      {
        kind: "p",
        text: "Nous demandons à chaque participant de respecter cet esprit. En contrepartie, nous vous offrons un « Véritable Trail Authentique » : un parcours nature, une ambiance au top et une après-course de folie !",
      },
    ],
  },
  {
    num: 2,
    title: "Les épreuves",
    blocks: [
      {
        kind: "p",
        text: "**2.1** L'Urbanbayern Trail des Collines se déroule **samedi 24 octobre 2026**. Le secrétariat ouvre à **17h00**. Le secrétariat ainsi que les lieux de départ et d'arrivée sont situés à la salle du CACS, Place 11, à Ellezelles.",
      },
      {
        kind: "p",
        text: "**2.2** L'événement se déroule **en binôme**, sur 9 ou 18 km :",
      },
      {
        kind: "table",
        head: ["Épreuve", "Départ"],
        rows: [
          ["18 km", "18h00"],
          ["9 km", "18h30"],
        ],
      },
      {
        kind: "p",
        text: "**2.3** L'âge minimum de participation est fixé à **15 ans**.",
      },
    ],
  },
  {
    num: 3,
    title: "Procédures d'inscription",
    blocks: [
      {
        kind: "p",
        text: "**3.1** Les inscriptions se font exclusivement en ligne via la plateforme Ultratiming. Le lien d'inscription est disponible sur la page UTC 4.",
      },
      {
        kind: "table",
        head: ["Distance", "En ligne", "Sur place"],
        rows: [
          ["9 km", "15 €/binôme", "+3 €/binôme"],
          ["18 km", "25 €/binôme", "+3 €/binôme"],
        ],
      },
      {
        kind: "p",
        text: "**3.2** En vue de garantir un accueil convivial et de qualité pour tous les coureurs, le nombre de participants (inscriptions payées) est limité à **600**, pour l'ensemble des épreuves.",
      },
      {
        kind: "note",
        icon: TriangleAlert,
        tone: "warning",
        text: "**3.3** En cas de non-participation ou de modification de distance, quelle qu'en soit la raison, la personne n'aura pas droit au remboursement.",
      },
    ],
  },
  {
    num: 4,
    title: "Parcours : respect des lieux et des propriétés privées",
    blocks: [
      {
        kind: "p",
        text: "Le tracé de la course a été dessiné en parcours trail à travers le village d'Ellezelles, dans le Pays des Collines. Les participants auront notamment l'occasion de (re)découvrir le sentier de l'Étrange, la Bruyère et quelques surprises locales ! Il s'agit de parcours à **75 % trail**, qui empruntent de nombreux sentiers monotrace.",
      },
      {
        kind: "p",
        text: "Course dans la course avec le Grand Prix **« Bellezellesbutte »** : segment en côte / chronométrage individuel.",
      },
      {
        kind: "p",
        text: "Les parcours traversent également plusieurs domaines privés dont l'accès n'est autorisé qu'à titre tout à fait exceptionnel, ce qui exclut tout passage ultérieur à travers ces propriétés. Des panneaux « PROPRIÉTÉ PRIVÉE » sont placés à l'entrée de ces domaines.",
      },
      {
        kind: "p",
        text: "Les participants sont tenus de respecter les parcours fléchés, de rester sur les chemins et sentiers, de n'emprunter aucun raccourci et de respecter scrupuleusement la quiétude des lieux.",
      },
      {
        kind: "note",
        icon: Trash2,
        tone: "warning",
        text: "Les participants sont tenus de respecter la propreté de la nature. **AUCUN DÉCHET** de quelque nature qu'il soit (papier, gobelet, sachet, …) ne sera toléré sur le parcours.",
      },
    ],
  },
  {
    num: 5,
    title: "Ravitaillement et éco-responsabilité",
    blocks: [
      {
        kind: "p",
        text: "La règle générale est que les trails se courent en **semi-autonomie**. Toutefois, **1 ravito** est prévu sur le parcours 18 km, plus un ravito complet pour tout le monde à l'arrivée (et une soupe maison gratuite).",
      },
      {
        kind: "p",
        text: "**AUCUN GOBELET** ne sera distribué aux endroits de ravitaillement. Ravitaillement à l'arrivée pour tous.",
      },
      {
        kind: "note",
        icon: Flashlight,
        tone: "warning",
        text: "Course nocturne : **lampe frontale obligatoire** pour tous.",
      },
    ],
  },
  {
    num: 6,
    title: "Responsabilité individuelle",
    blocks: [
      {
        kind: "p",
        text: "Tous les participants sont conscients, avant de prendre le départ de la discipline choisie, qu'ils participent à leurs propres risques et périls et qu'ils sont responsables des dommages qui leur sont imputables.",
      },
      {
        kind: "p",
        text: "Chaque participant atteste qu'il ne fait l'objet d'aucune contre-indication médicale pour la pratique de la course à pied en compétition.",
      },
      {
        kind: "p",
        text: "Dans son propre intérêt, il est rappelé à chaque participant de veiller à avoir un degré d'entraînement suffisant et d'éviter de prendre le départ s'il est sous l'effet d'un médicament antidouleur (ou semblable) ou s'il était récemment atteint d'une infection quelconque.",
      },
      {
        kind: "p",
        text: "Les participants déchargent l'organisation de toute responsabilité en cas d'accident de toutes sortes sur le parcours et dans les installations.",
      },
    ],
  },
  {
    num: 7,
    title: "Sécurité sur la voie publique",
    blocks: [
      {
        kind: "p",
        text: "Durant la course, la voie publique est empruntée à l'entrée et à la sortie du village d'Ellezelles et en quelques autres endroits de longueur très limitée (au total quelques centaines de mètres).",
      },
      {
        kind: "p",
        text: "Les participants n'ont pas la priorité à ces endroits et sont dans l'obligation de respecter le code de la route.",
      },
    ],
  },
  {
    num: 8,
    title: "Abandons",
    blocks: [
      {
        kind: "p",
        text: "Chaque participant retirant son dossard le jour de la course au bureau de départ est supposé être présent sur le parcours qu'il a choisi lors de son inscription.",
      },
      {
        kind: "p",
        text: "En cas de non-départ ou d'abandon, le participant est dans l'obligation d'en informer les organisateurs ou les personnes postées le long du parcours et de remettre son dossard, sous peine d'amende.",
      },
    ],
  },
  {
    num: 9,
    title: "Communication",
    blocks: [
      {
        kind: "p",
        text: "Il est impératif que les participants soient équipés d'un **téléphone portable** afin de pouvoir, en cas de problème majeur, prendre contact sans perte de temps avec les organisateurs.",
      },
      { kind: "tel" },
    ],
  },
  {
    num: 10,
    title: "Barrière horaire et fermeture du parcours",
    blocks: [
      {
        kind: "p",
        text: "Les parcours sont fermés officiellement après le passage du dernier participant, dans l'application des temps estimatifs du participant le moins rapide : **3 heures**.",
      },
      {
        kind: "p",
        text: "Tout participant qui demeurera de son plein gré sur l'un des parcours après la clôture officielle sera considéré comme hors course et ne bénéficiera plus de la supervision, ni de l'appui de la part de l'organisation du trail.",
      },
    ],
  },
  {
    num: 11,
    title: "Infrastructure",
    blocks: [
      {
        kind: "p",
        text: "Des vestiaires et douches sont mis à disposition ; une consigne est également prévue. Une assistance médicale spécialisée (poste de secours) sera installée au point de départ/arrivée.",
      },
      {
        kind: "p",
        text: "Une restauration et une buvette sont prévues à l'arrivée pour tous, sous chapiteau.",
      },
    ],
  },
  {
    num: 12,
    title: "Remise des prix",
    blocks: [
      {
        kind: "ul",
        items: [
          "1 podium pour chaque course ;",
          "1 podium pour les 1er, 2e et 3e femmes, hommes et mixtes ;",
          "1 podium « GP montagne » femmes et hommes, toutes distances confondues.",
        ],
      },
      {
        kind: "p",
        text: "La remise des prix est planifiée à **21h30**.",
      },
    ],
  },
  {
    num: 13,
    title: "Publications",
    blocks: [
      {
        kind: "p",
        text: "Les résultats seront publiés sur les sites ladtc.be et Ultratiming. Des photos seront prises par les journaux locaux, de même que par les organisateurs.",
      },
      {
        kind: "p",
        text: "Les participants donnent autorisation de diffuser les reportages télévisés les mettant en scène ainsi que les photos prises tout au long de l'événement.",
      },
      {
        kind: "p",
        text: "Ils donnent également autorisation de diffuser ou reproduire les photographies ou vidéos les mettant en scène, pour le site ladtc.be, pour publication dans la presse, ainsi que le téléchargement de ces photos ou vidéos sur Internet (réseaux sociaux).",
      },
      {
        kind: "p",
        text: "Tous les participants se doivent de connaître, accepter et se conformer au contenu du présent règlement. Ils acceptent également d'obéir aux indications des organisateurs et des personnes postées sur le parcours.",
      },
    ],
  },
];

function inline(text: string): React.ReactNode {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function BlockView({ block }: { block: Block }): React.ReactNode {
  switch (block.kind) {
    case "p":
      return <p>{inline(block.text)}</p>;
    case "ul":
      return (
        <ul className="list-disc space-y-1 pl-5">
          {block.items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>
      );
    case "table":
      return (
        <Table>
          <TableHeader>
            <TableRow>
              {block.head.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.rows.map((row, r) => (
              <TableRow key={r}>
                {row.map((cell, c) => (
                  <TableCell
                    key={c}
                    className={c === 0 ? "font-medium text-foreground" : undefined}
                  >
                    {inline(cell)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    case "note": {
      const isWarning = block.tone === "warning";
      return (
        <div
          className={`flex gap-3 rounded-lg border p-4 ${
            isWarning
              ? "border-destructive/25 bg-destructive/5"
              : "border-primary/25 bg-primary/5"
          }`}
        >
          <block.icon
            className={`mt-0.5 h-4 w-4 shrink-0 ${
              isWarning ? "text-destructive" : "text-primary"
            }`}
          />
          <p className="text-sm leading-relaxed text-foreground">
            {inline(block.text)}
          </p>
        </div>
      );
    }
    case "tel":
      return (
        <div className="rounded-lg border border-border p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            Contacts d&apos;urgence
          </p>
          <p className="text-sm">
            {telContacts.map((contact, i) => (
              <span key={contact.name}>
                {i > 0 && " · "}
                {contact.name} :{" "}
                <a
                  href={`tel:${contact.tel}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {contact.phone}
                </a>
              </span>
            ))}
          </p>
        </div>
      );
  }
}

export default function UtcReglementPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
          {utc.shortName} · {utc.edition}e édition
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Règlement</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Règlement officiel de l&apos;{utc.name}. Tous les participants se
          doivent de le connaître, l&apos;accepter et s&apos;y conformer. Merci
          et bonne course !
        </p>
      </div>

      <Card className="mb-10 border-border bg-card">
        <CardContent className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {keyInfo.map((item) => (
            <div key={item.label} className="flex gap-3">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-sm font-semibold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <nav className="mb-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Sommaire
        </p>
        <div className="flex flex-wrap gap-2">
          {articles.map((article) => (
            <a
              key={article.num}
              href={`#art-${article.num}`}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Art. {article.num} · {article.title.split(" :")[0]}
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-12">
        {articles.map((article) => (
          <section
            key={article.num}
            id={`art-${article.num}`}
            className="scroll-mt-24"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Art. {article.num}
            </p>
            <h2 className="mt-1 text-xl font-bold">{article.title}</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              {article.blocks.map((block, i) => (
                <BlockView key={i} block={block} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card className="mt-16 border-border bg-card text-center">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <p className="text-lg font-bold">Prêt à courir ?</p>
          <p className="text-sm text-muted-foreground">
            Les inscriptions se font via la plateforme Ultratiming.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/utc">Retour à la page {utc.shortName}</Link>
            </Button>
            {utc.registrationUrl && (
              <Button asChild>
                <a
                  href={utc.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  S&apos;inscrire à l&apos;{utc.shortName}
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
