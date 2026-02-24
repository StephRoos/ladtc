import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "LADTC - Les Amis Du Trail des Collines",
  description: "Trail running club in Ellezelles, Belgium. Community, training, and events for trail runners.",
  keywords: ["trail running", "running club", "Belgium", "Ellezelles", "Collines"],
  openGraph: {
    title: "LADTC - Trail Running Club",
    description: "Join our trail running community in Ellezelles, Belgium",
    url: "https://ladtc.be",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-background-DEFAULT text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
