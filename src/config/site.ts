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
