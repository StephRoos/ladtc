"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface NavLink {
  href: string;
  label: string;
  adminOnly?: boolean;
}

const adminNavLinks: NavLink[] = [
  { href: "/admin/dashboard", label: "Tableau de bord" },
  { href: "/members", label: "Membres" },
  { href: "/admin/products", label: "Produits" },
  { href: "/admin/orders", label: "Commandes" },
  { href: "/admin/statistics", label: "Statistiques" },
  { href: "/admin/activity-logs", label: "Logs d'activité" },
  { href: "/admin/users", label: "Utilisateurs", adminOnly: true },
];

/**
 * Protected layout for admin/committee pages.
 * Redirects to /auth/login if not authenticated.
 * Shows a forbidden message if the user lacks the required role.
 * Admin-only links are hidden from committee members.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  const isAdminOrCommittee =
    user &&
    "role" in user &&
    (user.role === "ADMIN" || user.role === "COMMITTEE");

  const isAdmin = user && "role" in user && user.role === "ADMIN";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-10">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdminOrCommittee) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Accès refusé</h1>
            <p className="mt-2 text-muted-foreground">
              Vous n&apos;avez pas les droits pour accéder à cette section.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const visibleLinks = adminNavLinks.filter(
    (link) => !link.adminOnly || isAdmin
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="border-b border-border bg-muted/30">
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
