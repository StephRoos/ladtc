import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
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
  },
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
      </body>
    </html>
  );
}
