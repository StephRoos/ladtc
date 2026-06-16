"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useContributionUrl,
  useUpdateContributionUrl,
} from "@/hooks/use-contribution-url";

/**
 * Admin field for the members' contribution link (Nextcloud file-drop). When
 * set, a public "Partager vos photos & vidéos" button appears on the gallery.
 * Committee-only (rendered inside the admin Paramètres page).
 */
export function ContributionUrlSettings(): React.ReactNode {
  const { data, isLoading } = useContributionUrl();
  const update = useUpdateContributionUrl();
  const [value, setValue] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; message: string } | null>(
    null
  );

  // Seed the input from the saved value once it loads (adjust-during-render
  // pattern, no setState-in-effect).
  const [seeded, setSeeded] = useState<string | undefined>(undefined);
  if (data !== undefined && data !== seeded) {
    setSeeded(data ?? undefined);
    setValue(data ?? "");
  }

  async function handleSave(): Promise<void> {
    setStatus(null);
    try {
      const saved = await update.mutateAsync((value ?? "").trim());
      setValue(saved);
      setStatus({
        kind: "ok",
        message: saved ? "Lien enregistré" : "Lien retiré (bouton masqué)",
      });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Échec de l'enregistrement",
      });
    }
  }

  return (
    <section className="mt-6 space-y-4 rounded-md border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground">
        Lien de contribution des membres
      </h2>
      <p className="text-sm text-muted-foreground">
        Lien de dépôt public Nextcloud (« file drop ») où les membres déposent
        leurs photos et vidéos. Quand il est renseigné, un bouton « Partager vos
        photos &amp; vidéos » apparaît sur la galerie. Laisser vide pour masquer
        le bouton.
      </p>

      <div className="grid gap-3 sm:grid-cols-[1fr,auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="contributionUrl">Lien de dépôt (URL HTTPS)</Label>
          <Input
            id="contributionUrl"
            type="url"
            value={value ?? ""}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://cloud.ladtc.be/s/…"
            disabled={isLoading || update.isPending}
          />
        </div>
        <Button onClick={handleSave} disabled={isLoading || update.isPending}>
          {update.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      {status && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`text-sm ${
            status.kind === "ok" ? "text-green-500" : "text-destructive"
          }`}
        >
          {status.message}
        </p>
      )}
    </section>
  );
}
