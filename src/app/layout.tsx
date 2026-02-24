import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LADTC - Les Amis Du Trail des Collines",
    template: "%s | LADTC",
  },
  description:
    "Club de trail running basé à Ellezelles, dans le Pays des Collines, en Belgique. Rejoignez notre communauté de passionnés.",
  keywords: ["trail running", "running club", "Belgique", "Ellezelles", "Collines", "LADTC"],
  openGraph: {
    title: "LADTC - Trail Running Club",
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
