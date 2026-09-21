import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";

const utc = siteConfig.utc;

export const metadata: Metadata = {
  title: `Règlement — L'${utc.name}`,
  description: `Règlement officiel de l'${utc.name} (${utc.shortName}) : épreuves, inscriptions, parcours, sécurité et droit à l'image.`,
};

type Article = {
  title: string;
  body: React.ReactNode;
};

const bodyClass =
  "space-y-3 text-sm leading-relaxed text-muted-foreground";

const numClass = "font-medium text-foreground";

const articles: Article[] = [
  {
    title: "Art. 1 – Notre esprit",
    body: (
      <div className={bodyClass}>
        <p>
          L&apos;esprit promu par notre club, la dtc, consiste à « courir
          pour le plaisir, en toute convivialité, dans le respect de chacun et
          de la nature ».
        </p>
        <p>
          En tant qu&apos;association de fait, nous ne recherchons aucun but
          lucratif, sinon celui d&apos;apporter une activité sportive à notre
          belle région des Collines.
        </p>
        <p>
          Nous demandons à chaque participant de respecter cet esprit. En
          contrepartie, nous vous offrons un « Véritable Trail Authentique » :
          un parcours nature, une ambiance au top et une après-course de folie !
        </p>
      </div>
    ),
  },
  {
    title: "Art. 2 – Les épreuves",
    body: (
      <div className={bodyClass}>
        <p>
          <span className={numClass}>2.1</span> L&apos;{utc.name} se déroule{" "}
          <span className={numClass}>samedi 24 octobre 2026</span>. Ouverture du
          secrétariat à <span className={numClass}>17h00</span>. Le secrétariat
          ainsi que les lieux de départ et d&apos;arrivée sont situés à la
          salle du CACS, Place 11, à Ellezelles.
        </p>
        <p>
          <span className={numClass}>2.2</span> L&apos;événement se déroule en
          binôme, sur 9 ou 18 km, sur deux boucles distinctes :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className={numClass}>18 km</span> : départ à{" "}
            <span className={numClass}>18h00</span>, deux boucles ;
          </li>
          <li>
            <span className={numClass}>9 km</span> : départ à{" "}
            <span className={numClass}>18h30</span>, une boucle.
          </li>
        </ul>
        <p>
          <span className={numClass}>2.3</span> L&apos;âge minimum de
          participation est fixé à <span className={numClass}>15 ans</span>.
        </p>
      </div>
    ),
  },
  {
    title: "Art. 3 – Procédures d'inscription",
    body: (
      <div className={bodyClass}>
        <p>
          <span className={numClass}>3.1</span> Les inscriptions se font
          exclusivement en ligne via la plateforme Ultratiming (lien
          d&apos;inscription disponible sur la page {utc.shortName}) :{" "}
          <span className={numClass}>25 €/binôme</span> pour le 18 km,{" "}
          <span className={numClass}>15 €/binôme</span> pour le 9 km.
          Inscription sur place possible avec une majoration de{" "}
          <span className={numClass}>3 €/binôme</span>.
        </p>
        <p>
          <span className={numClass}>3.2</span> En vue de garantir un accueil
          convivial et de qualité pour tous les coureurs, le nombre de
          participants (inscriptions payées) est limité à{" "}
          <span className={numClass}>600</span>, pour l&apos;ensemble des
          épreuves.
        </p>
        <p>
          <span className={numClass}>3.3</span> En cas de non-participation ou
          de modification de distance, quelle qu&apos;en soit la raison, la
          personne n&apos;aura pas droit au remboursement.
        </p>
      </div>
    ),
  },
  {
    title: "Art. 4 – Parcours : respect des lieux et des propriétés privées",
    body: (
      <div className={bodyClass}>
        <p>
          Le tracé de la course a été dessiné en parcours trail à travers le
          village d&apos;Ellezelles, dans le Pays des Collines. Les
          participants auront notamment l&apos;occasion de (re)découvrir le
          sentier de l&apos;Étrange, la Bruyère et quelques surprises locales !
          Il s&apos;agit de parcours à 75 % trail, qui empruntent de nombreux
          sentiers monotrace.
        </p>
        <p>
          Course dans la course avec le Grand Prix « Bellezellesbutte » :
          segment en côte / chronométrage individuel.
        </p>
        <p>
          Les parcours traversent également plusieurs domaines privés dont
          l&apos;accès n&apos;est autorisé qu&apos;à titre tout à fait
          exceptionnel, ce qui exclut tout passage ultérieur à travers ces
          propriétés. Des panneaux « PROPRIÉTÉ PRIVÉE » sont placés à
          l&apos;entrée de ces domaines.
        </p>
        <p>
          Les participants sont tenus de respecter les parcours fléchés, de
          rester sur les chemins et sentiers, de n&apos;emprunter aucun
          raccourci et de respecter scrupuleusement la quiétude des lieux.
        </p>
        <p>
          De même, les participants sont tenus de respecter la propreté de la
          nature. AUCUN DÉCHET de quelque nature qu&apos;il soit (papier,
          gobelet, sachet, …) ne sera toléré sur le parcours.
        </p>
      </div>
    ),
  },
  {
    title: "Art. 5 – Ravitaillement et éco-responsabilité",
    body: (
      <div className={bodyClass}>
        <p>
          La règle générale est que les trails se courent en semi-autonomie.
          Toutefois, <span className={numClass}>1 ravito</span> est prévu sur
          le parcours 18 km, plus un ravito complet pour tout le monde à
          l&apos;arrivée (et une soupe maison gratuite).
        </p>
        <p>
          AUCUN GOBELET ne sera distribué aux endroits de ravitaillement.
          Ravitaillement à l&apos;arrivée pour tous.
        </p>
        <p>
          Course nocturne : <span className={numClass}>lampe frontale
          obligatoire</span> pour tous.
        </p>
      </div>
    ),
  },
  {
    title: "Art. 6 – Responsabilité individuelle",
    body: (
      <div className={bodyClass}>
        <p>
          Tous les participants sont conscients, avant de prendre le départ de
          la discipline choisie, qu&apos;ils participent à leurs propres
          risques et périls et qu&apos;ils sont responsables des dommages qui
          leur sont imputables.
        </p>
        <p>
          Chaque participant atteste qu&apos;il ne fait l&apos;objet
          d&apos;aucune contre-indication médicale pour la pratique de la
          course à pied en compétition.
        </p>
        <p>
          Dans son propre intérêt, il est rappelé à chaque participant de
          veiller à avoir un degré d&apos;entraînement suffisant et
          d&apos;éviter de prendre le départ s&apos;il est sous l&apos;effet
          d&apos;un médicament antidouleur (ou semblable) ou s&apos;il était
          récemment atteint d&apos;une infection quelconque.
        </p>
        <p>
          Les participants déchargent l&apos;organisation de toute
          responsabilité en cas d&apos;accident de toutes sortes sur le
          parcours et dans les installations.
        </p>
      </div>
    ),
  },
  {
    title: "Art. 7 – Sécurité sur la voie publique",
    body: (
      <div className={bodyClass}>
        <p>
          Durant la course, la voie publique est empruntée à l&apos;entrée et
          à la sortie du village d&apos;Ellezelles et en quelques autres
          endroits de longueur très limitée (au total quelques centaines de
          mètres).
        </p>
        <p>
          Les participants n&apos;ont pas la priorité à ces endroits et sont
          dans l&apos;obligation de respecter le code de la route.
        </p>
      </div>
    ),
  },
  {
    title: "Art. 8 – Abandons",
    body: (
      <div className={bodyClass}>
        <p>
          Chaque participant retirant son dossard le jour de la course au
          bureau de départ est supposé être présent sur le parcours
          qu&apos;il a choisi lors de son inscription.
        </p>
        <p>
          En cas de non-départ ou d&apos;abandon, le participant est dans
          l&apos;obligation d&apos;en informer les organisateurs ou les
          personnes postées le long du parcours et de remettre son dossard,
          sous peine d&apos;amende.
        </p>
      </div>
    ),
  },
  {
    title: "Art. 9 – Communication",
    body: (
      <div className={bodyClass}>
        <p>
          Il est impératif que les participants soient équipés d&apos;un
          téléphone portable afin de pouvoir, en cas de problème majeur,
          prendre contact sans perte de temps avec les organisateurs.
        </p>
        <p>
          Contacts d&apos;urgence : Mathieu{" "}
          <a
            href="tel:+32497124764"
            className="font-medium text-foreground hover:underline"
          >
            0497/12 47 64
          </a>{" "}
          · Maxime{" "}
          <a
            href="tel:+32478769927"
            className="font-medium text-foreground hover:underline"
          >
            0478/76 99 27
          </a>
        </p>
      </div>
    ),
  },
  {
    title: "Art. 10 – Barrière horaire et fermeture du parcours",
    body: (
      <div className={bodyClass}>
        <p>
          Les parcours sont fermés officiellement après le passage du dernier
          participant, dans l&apos;application des temps estimatifs du
          participant le moins rapide :{" "}
          <span className={numClass}>3 heures</span>.
        </p>
        <p>
          Tout participant qui demeurera de son plein gré sur l&apos;un des
          parcours après la clôture officielle sera considéré comme hors
          course et ne bénéficiera plus de la supervision, ni de l&apos;appui
          de la part de l&apos;organisation du trail.
        </p>
      </div>
    ),
  },
  {
    title: "Art. 11 – Infrastructure",
    body: (
      <div className={bodyClass}>
        <p>
          Des vestiaires et douches sont mis à disposition ; une consigne est
          également prévue. Une assistance médicale spécialisée (poste de
          secours) sera installée au point de départ/arrivée.
        </p>
        <p>
          Une restauration et une buvette sont prévues à l&apos;arrivée pour
          tous, sous chapiteau.
        </p>
      </div>
    ),
  },
  {
    title: "Art. 12 – Remise des prix",
    body: (
      <div className={bodyClass}>
        <ul className="list-disc space-y-1 pl-5">
          <li>1 podium pour chaque course ;</li>
          <li>1 podium pour les 1er, 2e et 3e femmes, hommes et mixtes ;</li>
          <li>
            1 podium « GP montagne » femmes et hommes, toutes distances
            confondues.
          </li>
        </ul>
        <p>
          La remise des prix est planifiée à{" "}
          <span className={numClass}>21h30</span>.
        </p>
      </div>
    ),
  },
  {
    title: "Art. 13 – Publications",
    body: (
      <div className={bodyClass}>
        <p>
          Les résultats seront publiés sur les sites ladtc.be et Ultratiming.
          Des photos seront prises par les journaux locaux, de même que par
          les organisateurs.
        </p>
        <p>
          Les participants donnent autorisation de diffuser les reportages
          télévisés les mettant en scène ainsi que les photos prises tout au
          long de l&apos;événement.
        </p>
        <p>
          Ils donnent également autorisation de diffuser ou reproduire les
          photographies ou vidéos les mettant en scène, pour le site ladtc.be,
          pour publication dans la presse, ainsi que le téléchargement de ces
          photos ou vidéos sur Internet (réseaux sociaux).
        </p>
        <p>
          Tous les participants se doivent de connaître, accepter et se
          conformer au contenu du présent règlement. Ils acceptent également
          d&apos;obéir aux indications des organisateurs et des personnes
          postées sur le parcours.
        </p>
      </div>
    ),
  },
];

export default function UtcReglementPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
          {utc.shortName}
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Règlement</h1>
        <p className="mt-3 text-muted-foreground">
          Règlement officiel de l&apos;{utc.name}, {utc.edition}e édition.
          Merci et bonne course !
        </p>
      </div>

      <div className="space-y-6">
        {articles.map((article) => (
          <Card key={article.title} className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{article.title}</CardTitle>
            </CardHeader>
            <CardContent>{article.body}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
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
    </div>
  );
}
