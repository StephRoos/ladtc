import type { Metadata } from "next";
import { EquipmentBioracerLink } from "./EquipmentBioracerLink";
import { MembershipGate } from "@/components/equipment/MembershipGate";
import { getBioracerUrl } from "@/lib/settings";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Équipement | ${siteConfig.name}`,
  description: "Commandez l'équipement officiel du club LADTC via Bioracer.",
  openGraph: {
    title: "Équipement",
    description: "Commandez l'équipement officiel du club LADTC via Bioracer.",
    url: `${siteConfig.url}/equipment`,
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
 * Equipment page — redirects members to the Bioracer store.
 * Access is gated to members in good standing (active membership for the
 * current season) via MembershipGate.
 */
export default async function EquipmentPage(): Promise<React.ReactNode> {
  const bioracerUrl = await getBioracerUrl();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Équipement du club</h1>
        <p className="mt-2 text-muted-foreground">
          Commandez l&apos;équipement officiel LADTC — maillots, vestes, accessoires.
        </p>
      </div>
      <MembershipGate>
        <EquipmentBioracerLink url={bioracerUrl} />
      </MembershipGate>
    </div>
  );
}
