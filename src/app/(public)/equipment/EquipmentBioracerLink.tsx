"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Client component displayed inside MembershipGate. Shows a button linking
 * to the external Bioracer store where members order club equipment.
 */
export function EquipmentBioracerLink({ url }: { url: string }): React.ReactNode {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Commander mon équipement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Les commandes d&apos;équipement (maillots, vestes, accessoires) se font
          via la boutique en ligne Bioracer, partenaire officiel du club.
        </p>
        <p className="text-sm text-muted-foreground">
          Le lien ci-dessous est réservé aux membres en ordre de cotisation.
          Bioracer gère directement le catalogue, les tailles, et la livraison.
        </p>
        <Button asChild className="w-full">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Accéder à la boutique Bioracer
          </a>
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Le lien s&apos;ouvre dans un nouvel onglet
        </p>
      </CardContent>
    </Card>
  );
}
