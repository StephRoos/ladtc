"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { signOut } from "@/lib/auth-client";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/blog", label: "Blog" },
  { href: "/equipment", label: "Équipement" },
  { href: "/team", label: "Équipe" },
  { href: "/contact", label: "Contact" },
];

/**
 * Site navigation header with mobile menu and auth state
 */
export function Header(): React.ReactNode {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const { itemCount } = useCart();

  async function handleSignOut(): Promise<void> {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const isAdminOrCommittee =
    user &&
    "role" in user &&
    (user.role === "ADMIN" || user.role === "COMMITTEE");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">LADTC</span>
          <span className="hidden text-sm text-muted-foreground sm:block">
            {siteConfig.fullName}
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {isAdminOrCommittee && (
            <>
              <li>
                <Link
                  href="/admin/members"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname.startsWith("/admin/members")
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Gestion membres
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/products"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname.startsWith("/admin/products")
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Produits
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/orders"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname.startsWith("/admin/orders")
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Commandes
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Auth buttons — desktop */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Cart icon */}
          <Link
            href="/equipment/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-primary"
            aria-label={`Panier (${itemCount} article${itemCount !== 1 ? "s" : ""})`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {!isLoading && !isAuthenticated && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Se connecter</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">S&apos;inscrire</Link>
              </Button>
            </>
          )}
          {!isLoading && isAuthenticated && user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">Mon profil</Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                {user.name ?? user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                Se déconnecter
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          <span className="sr-only">{menuOpen ? "Fermer" : "Menu"}</span>
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block py-1 text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAdminOrCommittee && (
              <>
                <li>
                  <Link
                    href="/admin/members"
                    className={cn(
                      "block py-1 text-sm font-medium transition-colors hover:text-primary",
                      pathname.startsWith("/admin/members")
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    Gestion membres
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/products"
                    className={cn(
                      "block py-1 text-sm font-medium transition-colors hover:text-primary",
                      pathname.startsWith("/admin/products")
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    Produits
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/orders"
                    className={cn(
                      "block py-1 text-sm font-medium transition-colors hover:text-primary",
                      pathname.startsWith("/admin/orders")
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    Commandes
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Auth — mobile */}
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {!isLoading && !isAuthenticated && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                    Se connecter
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                    S&apos;inscrire
                  </Link>
                </Button>
              </>
            )}
            {!isLoading && isAuthenticated && user && (
              <>
                <p className="text-sm text-muted-foreground">
                  {user.name ?? user.email}
                </p>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile" onClick={() => setMenuOpen(false)}>
                    Mon profil
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  Se déconnecter
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
