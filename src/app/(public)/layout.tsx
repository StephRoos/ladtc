import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

/**
 * Shared layout for all public-facing pages
 * Includes the site header and footer
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
