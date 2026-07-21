"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DtcMeaningsSettings } from "@/components/admin/settings/DtcMeaningsSettings";
import { ContributionUrlSettings } from "@/components/admin/settings/ContributionUrlSettings";
import { CommitteeRolesSettings } from "@/components/admin/settings/CommitteeRolesSettings";

const SHIPPING_FEE_KEY = "equipment.shippingFee";

/**
 * Admin page for tunable settings.
 * Only one knob for now (equipment shipping fee). Add new fields here as
 * settings grow — each key is independent and persisted via PATCH /api/settings/[key].
 */
export default function AdminSettingsPage(): React.ReactNode {
  const [shippingFee, setShippingFee] = useState<string>("");
  const [initialFee, setInitialFee] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch(`/api/settings/${SHIPPING_FEE_KEY}`)
      .then((res) => (res.ok ? res.json() : { value: null }))
      .then((data) => {
        if (typeof data.value === "number") {
          setShippingFee(data.value.toFixed(2));
          setInitialFee(data.value);
        }
      })
      .catch(() => {
        setStatus({ kind: "error", message: "Impossible de charger la configuration" });
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave(): Promise<void> {
    setStatus(null);
    const value = Number(shippingFee.replace(",", "."));
    if (!Number.isFinite(value) || value < 0) {
      setStatus({ kind: "error", message: "Le frais doit être un nombre positif ou zéro" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/settings/${SHIPPING_FEE_KEY}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus({ kind: "error", message: body.error ?? "Échec de l'enregistrement" });
        return;
      }

      setInitialFee(value);
      setStatus({ kind: "ok", message: "Configuration enregistrée" });
    } finally {
      setIsSaving(false);
    }
  }

  const dirty = initialFee !== null && Number(shippingFee.replace(",", ".")) !== initialFee;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Paramètres</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Valeurs ajustables sans redéploiement. Modifications appliquées immédiatement aux
        nouvelles commandes.
      </p>

      <section className="space-y-4 rounded-md border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground">Équipement — livraison</h2>
        <p className="text-sm text-muted-foreground">
          Frais ajoutés à une commande quand le membre choisit la livraison à domicile.
          Le retrait au club reste gratuit.
        </p>

        <div className="grid gap-3 sm:grid-cols-[1fr,auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="shippingFee">Frais de livraison (€)</Label>
            <Input
              id="shippingFee"
              type="number"
              step="0.01"
              min="0"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              disabled={isLoading || isSaving}
              placeholder="5.00"
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

      <div className="mt-6">
        <DtcMeaningsSettings />
      </div>

      <ContributionUrlSettings />

      <div className="mt-6">
        <CommitteeRolesSettings />
      </div>
    </div>
  );
}
