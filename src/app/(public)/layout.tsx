import type { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Accueil | ${siteConfig.name}`,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.fullName,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.fullName,
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
};

/**
 * Shared layout for all public-facing pages.
 * Provides default metadata and includes header/footer.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
