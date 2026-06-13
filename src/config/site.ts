/**
 * Site configuration and metadata
 */

export const siteConfig = {
  name: "la dtc",
  fullName: "la dtc",
  description: "Club de trail running à Ellezelles, Pays des Collines, Belgique",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og.png`,
  links: {
    facebookPublic: "https://www.facebook.com/groups/1577873296894853/",
    facebookMembers: "https://www.facebook.com/groups/1355264578348185",
  },
  contact: {
    address: "Ellezelles, Pays des Collines, Belgique",
  },
  club: {
    location: "Ellezelles",
    region: "Pays des Collines",
  },
  /**
   * UTC — Ultra Trail des Collines, the race organized by the club.
   * Update these values once the committee validates the edition details.
   * `registrationUrl: null` displays a "coming soon" state on /utc.
   */
  utc: {
    edition: 4,
    name: "Urbanbayern Trail des Collines",
    shortName: "UTC 4",
    // Date confirmed by the committee (2026-06-12) — night race
    date: "Samedi 24 octobre 2026" as string | null,
    // Venue updated by the committee (2026-06-12): Salle CACS, Ellezelles
    location: "Salle CACS, Ellezelles",
    // Registration link not available yet (Ultratiming) — confirmed 2026-06-12
    registrationUrl: null as string | null,
    // Former race website (urbanbayerntrail.be) decommissioned — replaced by /utc
    externalSiteUrl: null as string | null,
    contactEmail: "admin@ladtc.be" as string | null,
    // Gallery category used to illustrate the /utc page. Photos tagged with this
    // exact category (case-sensitive) are shown in the "En images" section.
    galleryCategory: "urbanbayern",
    sponsoring: {
      // Club account for sponsor payments, as printed on the sponsoring doc
      iban: "BE71 0019 4925 1069",
      paymentReference: "sponsor course DTC + nom de l'entreprise",
      tiers: [1000, 500, 250, 100, 50],
    },
  },
  schedule: {
    training: [
      {
        day: "Wednesday",
        time: "19:00",
        location: "Ellezelles town square",
      },
      {
        day: "Sunday",
        time: "08:45",
        location: "Ellezelles town square",
      },
    ],
  },
};

/**
 * Random meanings for "la dtc" — displayed randomly on each visit.
 * Committee members can update this list.
 */
export const dtcMeanings: string[] = [
  "la Dominicale Trail Club",
  "la Découverte du Trail des Collines",
  "la Dynamique du Trail des Collines",
  "la Déjantée du Trail des Collines",
  "la Dose de Trail et de Collines",
];

/**
 * Pick a random meaning for "la dtc"
 */
export function getRandomDtcMeaning(): string {
  return dtcMeanings[Math.floor(Math.random() * dtcMeanings.length)];
}

export type SiteConfig = typeof siteConfig;
