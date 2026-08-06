import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Providers } from "./providers";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ladtc.be";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "la dtc — trail running club",
    template: "%s | la dtc",
  },
  description:
    "Club de trail running à Ellezelles, Pays des Collines, Belgique. Rejoignez notre communauté de passionnés.",
  keywords: ["trail running", "running club", "Belgique", "Ellezelles", "Collines", "la dtc"],
  openGraph: {
    title: "la dtc — trail running club",
    description: "Club de trail running à Ellezelles, Pays des Collines, Belgique",
    url: "https://ladtc.be",
    type: "website",
    locale: "fr_BE",
    images: [
      {
        // Stopgap until a dedicated 1200×630 OG image is designed.
        url: `${SITE_URL}/images/hero-bg.jpg`,
        width: 1200,
        height: 630,
        alt: "la dtc — trail running dans le Pays des Collines",
      },
    ],
  },
};

/**
 * Site-wide Organization structured data — improves Google indexing for the
 * club itself (separate from the SportsEvent JSON-LD on /utc which describes
 * the race). Injected in the root layout so it's present on every page.
 */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: "la dtc",
  alternateName: "LADTC",
  description: "Club de trail running à Ellezelles, Pays des Collines, Belgique.",
  url: SITE_URL,
  sport: "Trail running",
  areaServed: "Ellezelles, Pays des Collines, Belgique",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
