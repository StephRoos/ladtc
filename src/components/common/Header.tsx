"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth-client";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/blog", label: "Blog" },
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
            <li>
              <Link
                href="/admin/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname.startsWith("/admin")
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Administration
              </Link>
            </li>
          )}
        </ul>

        {/* Auth buttons — desktop */}
        <div className="hidden items-center gap-2 md:flex">
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
              <li>
                <Link
                  href="/admin/dashboard"
                  className={cn(
                    "block py-1 text-sm font-medium transition-colors hover:text-primary",
                    pathname.startsWith("/admin")
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  Administration
                </Link>
              </li>
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
