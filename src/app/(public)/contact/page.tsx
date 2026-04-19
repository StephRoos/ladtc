import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.name}`,
  description:
    "Contactez la dtc — club de trail running à Ellezelles, Pays des Collines.",
  openGraph: {
    title: `Contact | ${siteConfig.name}`,
    description:
      "Contactez la dtc — club de trail running à Ellezelles, Pays des Collines.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.fullName,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.fullName,
      },
    ],
  },
};

/**
 * Contact page — contact form with club info sidebar
 */
export default function ContactPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Poser une question</h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Une question sur les entraînements, les événements ou le
          fonctionnement du club ? Ce formulaire est là pour ça.
        </p>
      </div>

      {/* CTA towards registration */}
      <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Pour devenir membre du club, ce n&apos;est pas ici.{" "}
          <Link
            href="/auth/register"
            className="font-medium text-primary hover:underline"
          >
            Créer un compte membre &rarr;
          </Link>
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: contact form */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">Envoyer un message</h2>
          <ContactForm />
        </div>

        {/* Right: contact info */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">Informations pratiques</h2>

          <div className="space-y-6">
            {/* Contact details */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Coordonnées</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-primary">📍</span>
                  <span className="text-muted-foreground">
                    {siteConfig.contact.address}
                  </span>
                </li>
              </ul>
            </div>

            {/* Training schedule */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Entraînements</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {siteConfig.schedule.training.map((session) => (
                  <li key={session.day} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {session.day === "Wednesday" ? "Me" : "Di"}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">
                        {session.day === "Wednesday" ? "Mercredi" : "Dimanche"}
                      </span>{" "}
                      à {session.time} — {session.location}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social links */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Réseaux sociaux</h3>
              <div className="flex gap-4">
                <a
                  href={siteConfig.links.facebookPublic}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  Facebook (public)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
