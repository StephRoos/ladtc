"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import {
  useAdminAlbums,
  useCreateAlbum,
  useUpdateAlbum,
  useDeleteAlbum,
  type AdminAlbum,
} from "@/hooks/use-gallery-albums";

/** yyyy-mm-dd for a date input, from an ISO date string (or "" when null). */
function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

function AlbumRow({ album }: { album: AdminAlbum }): React.ReactNode {
  const updateAlbum = useUpdateAlbum();
  const deleteAlbum = useDeleteAlbum();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(album.name);
  const [date, setDate] = useState(toDateInput(album.date));
  const [error, setError] = useState<string | null>(null);

  async function save(): Promise<void> {
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }
    setError(null);
    try {
      await updateAlbum.mutateAsync({ id: album.id, data: { name, date } });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function remove(): Promise<void> {
    if (
      !confirm(
        `Supprimer l'album « ${album.name} » ? Les photos seront conservées (sans album).`
      )
    )
      return;
    await deleteAlbum.mutateAsync(album.id);
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border px-3 py-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 w-48"
          placeholder="Nom de l'album"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-8 w-40"
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
        <div className="ml-auto flex gap-1">
          <Button size="sm" onClick={save} disabled={updateAlbum.isPending}>
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(false);
              setName(album.name);
              setDate(toDateInput(album.date));
              setError(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
      <div className="min-w-0">
        <p className="truncate font-medium">{album.name}</p>
        <p className="text-xs text-muted-foreground">
          {album.photoCount} {album.photoCount > 1 ? "photos" : "photo"}
          {album.date &&
            ` · ${new Date(album.date).toLocaleDateString("fr-BE")}`}
        </p>
      </div>
      <div className="ml-auto flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={remove}
          disabled={deleteAlbum.isPending}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Admin panel to create, rename, re-date and delete gallery albums
 * (event folders). Deleting an album keeps its photos (they become unfiled).
 */
export function AlbumManager(): React.ReactNode {
  const { data: albums, isLoading } = useAdminAlbums();
  const createAlbum = useCreateAlbum();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }
    setError(null);
    try {
      await createAlbum.mutateAsync({ name, date: date || undefined });
      setName("");
      setDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <section className="mb-8 rounded-lg border border-border p-4">
      <h2 className="mb-3 text-lg font-semibold">Albums (événements)</h2>

      <form onSubmit={create} className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <Label htmlFor="new-album-name" className="text-xs">
            Nouvel album
          </Label>
          <Input
            id="new-album-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: UTC 3 — 2025"
            className="mt-1 h-9 w-56"
          />
        </div>
        <div>
          <Label htmlFor="new-album-date" className="text-xs">
            Date (optionnel)
          </Label>
          <Input
            id="new-album-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 h-9 w-40"
          />
        </div>
        <Button type="submit" disabled={createAlbum.isPending}>
          <Plus className="mr-1 h-4 w-4" />
          Créer
        </Button>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : albums && albums.length > 0 ? (
        <div className="space-y-2">
          {albums.map((album) => (
            <AlbumRow key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucun album. Créez-en un pour classer les photos par événement.
        </p>
      )}
    </section>
  );
}
