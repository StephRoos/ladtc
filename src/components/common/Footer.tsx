import Link from "next/link";
import { siteConfig } from "@/config/site";

/**
 * Site footer with club info, navigation links and social media links
 */
export function Footer(): React.ReactNode {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Club info */}
          <div>
            <h3 className="mb-3 text-lg font-bold text-primary">LADTC</h3>
            <p className="text-sm text-muted-foreground">{siteConfig.fullName}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {siteConfig.contact.address}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="hover:text-primary"
              >
                {siteConfig.contact.email}
              </a>
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Accueil" },
                { href: "/blog", label: "Blog" },
                { href: "/team", label: "Équipe" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social links & schedule */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Entraînements
            </h3>
            <ul className="space-y-1">
              {siteConfig.schedule.training.map((session) => (
                <li key={session.day} className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {session.day === "Wednesday" ? "Mercredi" : "Dimanche"}
                  </span>{" "}
                  à {session.time}
                </li>
              ))}
            </ul>

            <h3 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wider text-foreground">
              Réseaux sociaux
            </h3>
            <div className="flex gap-4">
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Facebook
              </a>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {siteConfig.fullName}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
