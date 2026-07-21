"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useCommitteeRoles, useUpdateCommitteeRoles } from "@/hooks/use-committee-roles";

/**
 * Editable list of committee functions (Président, Trésorier, …) shown as a
 * dropdown in the user management page. Committee-only (rendered inside the
 * admin Paramètres page). Saving filters out blank lines; the server keeps
 * at least one entry.
 */
export function CommitteeRolesSettings(): React.ReactNode {
  const { data, isLoading } = useCommitteeRoles();
  const updateRoles = useUpdateCommitteeRoles();
  const [items, setItems] = useState<string[]>([]);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; message: string } | null>(
    null
  );

  // Seed (and re-seed after a save) the editable rows from the loaded list by
  // adjusting state during render — the React-recommended alternative to a
  // setState-in-effect. `data` keeps a stable reference until it actually
  // changes, so this runs only on load and after a successful save.
  const [seededFrom, setSeededFrom] = useState<string[] | undefined>(undefined);
  if (data && data !== seededFrom) {
    setSeededFrom(data);
    setItems(data);
  }

  function updateItem(index: number, value: string): void {
    setItems((prev) => prev.map((it, i) => (i === index ? value : it)));
  }

  function removeItem(index: number): void {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem(): void {
    setItems((prev) => [...prev, ""]);
  }

  async function handleSave(): Promise<void> {
    setStatus(null);
    const cleaned = items.map((s) => s.trim()).filter((s) => s.length > 0);
    if (cleaned.length === 0) {
      setStatus({ kind: "error", message: "Ajoutez au moins une fonction" });
      return;
    }
    try {
      const saved = await updateRoles.mutateAsync(cleaned);
      setItems(saved);
      setStatus({ kind: "ok", message: "Fonctions enregistrées" });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Échec de l'enregistrement",
      });
    }
  }

  return (
    <section className="space-y-4 rounded-md border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground">Fonctions du comité</h2>
      <p className="text-sm text-muted-foreground">
        Liste des fonctions sélectionnables dans la page Utilisateurs (Président,
        Trésorier, …). Une ligne par fonction. Les lignes vides sont ignorées.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder="ex: Président"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                aria-label="Supprimer cette fonction"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" />
            Ajouter une fonction
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={isLoading || updateRoles.isPending}
        >
          {updateRoles.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
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
      </div>
    </section>
  );
}
