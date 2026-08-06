import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

const utc = siteConfig.utc;

export const metadata: Metadata = {
  title: `Règlement — L'${utc.name}`,
  description: `Règlement officiel de l'${utc.name} (${utc.shortName}).`,
};

/**
 * UTC regulation page — placeholder.
 * The committee will provide the final regulation (as a photo of the
 * official document) to be published here.
 */
export default function UtcReglementPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
          {utc.shortName}
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Règlement</h1>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-start gap-4 pt-6">
          <p className="text-muted-foreground">
            Le règlement officiel de l&apos;{utc.name} sera publié ici
            prochainement.
          </p>
          <Button variant="outline" asChild>
            <Link href="/utc">Retour à la page {utc.shortName}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
