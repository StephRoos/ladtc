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
            <h3 className="mb-3 text-lg font-bold text-primary">la dtc</h3>
            <p className="text-sm text-muted-foreground">
              Club de trail running
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {siteConfig.contact.address}
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
              Nous suivre
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href={siteConfig.links.facebookPublic}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} la dtc. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
