import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Événements | ${siteConfig.name}`,
  description:
    "Découvrez les prochains événements du club : entraînements, courses, stages et sorties sociales.",
  openGraph: {
    title: `Événements | ${siteConfig.name}`,
    description:
      "Découvrez les prochains événements du club : entraînements, courses, stages et sorties sociales.",
    url: `${siteConfig.url}/events`,
    siteName: siteConfig.fullName,
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
};

/**
 * Events layout — provides SEO metadata for event routes.
 */
export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return children;
}
