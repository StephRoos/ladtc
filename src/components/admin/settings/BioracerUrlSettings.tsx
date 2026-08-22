"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KEY = "equipment.bioracerUrl";

/**
 * Admin field for the Bioracer store URL members are redirected to when they
 * want to order club equipment. Committee-only (rendered inside the admin
 * Paramètres page).
 */
export function BioracerUrlSettings(): React.ReactNode {
  const [value, setValue] = useState<string>("");
  const [loaded, setLoaded] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; message: string } | null>(
    null,
  );

  // Load once on mount
  if (isLoading) {
    fetch(`/api/settings/${KEY}`)
      .then((res) => (res.ok ? res.json() : { value: null }))
      .then((data) => {
        const v = typeof data.value === "string" ? data.value : "";
        setValue(v);
        setLoaded(v);
      })
      .catch(() => {
        setStatus({ kind: "error", message: "Impossible de charger la configuration" });
      })
      .finally(() => setIsLoading(false));
  }

  async function handleSave(): Promise<void> {
    setStatus(null);
    const trimmed = value.trim();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/settings/${KEY}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: trimmed }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus({ kind: "error", message: body.error ?? "Échec de l'enregistrement" });
        return;
      }
      setLoaded(trimmed);
      setStatus({ kind: "ok", message: "Lien enregistré" });
    } finally {
      setIsSaving(false);
    }
  }

  const dirty = value.trim() !== loaded;

  return (
    <section className="mt-6 space-y-4 rounded-md border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground">
        Équipement — boutique Bioracer
      </h2>
      <p className="text-sm text-muted-foreground">
        Lien vers la boutique Bioracer où les membres commandent
        l&apos;équipement du club. Les membres non connectés ou dont la
        cotisation n&apos;est pas à jour ne voient pas le lien.
      </p>

      <div className="grid gap-3 sm:grid-cols-[1fr,auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="bioracerUrl">URL de la boutique (HTTPS)</Label>
          <Input
            id="bioracerUrl"
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://www.bioracer.fr/fr/mybioracer/?r=..."
            disabled={isLoading || isSaving}
          />
        </div>
        <Button onClick={handleSave} disabled={isLoading || isSaving || !dirty}>
          {isSaving ? "Enregistrement..." : "Enregistrer"}
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
