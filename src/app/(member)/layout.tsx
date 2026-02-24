import type { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

export const metadata: Metadata = {
  title: {
    default: "Espace membre - LADTC",
    template: "%s | LADTC",
  },
};

/**
 * Protected layout for member pages.
 * Includes the site Header and Footer.
 * Authentication is enforced client-side via useRequireAuth in each page.
 */
export default function MemberLayout({
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
