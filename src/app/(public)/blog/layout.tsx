import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description:
    "Actualités, comptes-rendus de courses et vie du club la dtc.",
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description:
      "Actualités, comptes-rendus de courses et vie du club la dtc.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.fullName,
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
};

/**
 * Blog layout — provides SEO metadata for blog routes.
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return children;
}
