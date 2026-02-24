/**
 * Site configuration and metadata
 */

export const siteConfig = {
  name: "LADTC",
  fullName: "Les Amis Du Trail des Collines",
  description: "Trail running club in Ellezelles, Belgium",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og.png`,
  links: {
    twitter: "https://twitter.com/ladtc",
    facebook: "https://facebook.com/ladtc",
    instagram: "https://instagram.com/ladtc",
  },
  contact: {
    email: process.env.ADMIN_EMAIL || "contact@ladtc.be",
    phone: "+32 (0) 2 xxx xxxx",
    address: "Ellezelles, Pays des Collines, Belgium",
  },
  club: {
    founded: 2010,
    memberCount: 70,
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
        time: "08:30",
        location: "Ellezelles town square",
      },
    ],
  },
};

export type SiteConfig = typeof siteConfig;
