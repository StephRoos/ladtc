import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Galerie photos | ${siteConfig.name}`,
  description:
    "Découvrez les photos du club la dtc : courses, entraînements, sorties et moments de convivialité.",
  openGraph: {
    title: `Galerie photos | ${siteConfig.name}`,
    description:
      "Découvrez les photos du club la dtc : courses, entraînements, sorties et moments de convivialité.",
    url: `${siteConfig.url}/gallery`,
    siteName: siteConfig.fullName,
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
};

/**
 * Gallery layout — provides SEO metadata for gallery routes.
 */
export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return children;
}
