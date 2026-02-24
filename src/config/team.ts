import type { TeamMember } from "@/types";

/**
 * Committee members (Le Comité)
 */
export const committeeMembers: TeamMember[] = [
  {
    id: "jean-dupont",
    name: "Jean Dupont",
    role: "Président",
    bio: "Passionné de trail running depuis 2010, Jean coordonne les activités du club et représente LADTC auprès des fédérations sportives. Il organise nos événements phares chaque année.",
    email: "president@ladtc.be",
  },
  {
    id: "marie-lambert",
    name: "Marie Lambert",
    role: "Trésorière",
    bio: "Marie gère les finances du club avec rigueur depuis 5 ans. Elle veille à la bonne santé budgétaire et coordonne les inscriptions aux courses officielles.",
    email: "tresorerie@ladtc.be",
  },
  {
    id: "pierre-martin",
    name: "Pierre Martin",
    role: "Secrétaire",
    bio: "Pierre s'occupe de la communication officielle du club, des procès-verbaux et de la coordination administrative. Il est le point de contact pour toutes les questions organisationnelles.",
    email: "secretariat@ladtc.be",
  },
  {
    id: "sophie-defays",
    name: "Sophie Defays",
    role: "Coordinatrice événements",
    bio: "Sophie organise les sorties, les camps d'entraînement et les participations collectives aux courses. Elle est la moteur de la vie sociale du club.",
    email: "evenements@ladtc.be",
  },
];

/**
 * Coaches (Les Coachs)
 */
export const coaches: TeamMember[] = [
  {
    id: "luc-vermeersch",
    name: "Luc Vermeersch",
    role: "Coach Trail",
    specialty: "Trail longue distance, technique en montée",
    bio: "Luc est diplômé entraîneur athlétisme. Spécialisé dans le trail longue distance, il encadre nos séances du mercredi et prépare les plans d'entraînement personnalisés.",
  },
  {
    id: "anne-dubois",
    name: "Anne Dubois",
    role: "Coach Running",
    specialty: "Course sur route, préparation physique générale",
    bio: "Anne accompagne les débutants et les coureurs intermédiaires dans leur progression. Elle organise les sorties du dimanche et les ateliers technique de course.",
  },
  {
    id: "thomas-gerard",
    name: "Thomas Gérard",
    role: "Coach Préparation physique",
    specialty: "Renforcement musculaire, prévention des blessures",
    bio: "Thomas est kinésithérapeute de formation. Il intègre des exercices de renforcement dans nos entraînements et conseille les membres sur la prévention des blessures.",
  },
];
