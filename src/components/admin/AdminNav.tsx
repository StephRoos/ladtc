"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/events", label: "Événements" },
  { href: "/admin/gallery", label: "Galerie" },
  { href: "/admin/statistics", label: "Statistiques" },
  { href: "/admin/activity-logs", label: "Logs d'activité" },
  { href: "/admin/users", label: "Utilisateurs", adminOnly: true },
];

/**
 * Admin sub-navigation bar (client component for active route highlighting)
 */
export function AdminNav({ isAdmin }: { isAdmin: boolean }): React.ReactNode {
  const pathname = usePathname();

  const visibleLinks = adminNavLinks.filter(
    (link) => !link.adminOnly || isAdmin
  );

  return (
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
  );
}
