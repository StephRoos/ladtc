"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadPhoto } from "@/hooks/use-gallery";
import { useAdminAlbums } from "@/hooks/use-gallery-albums";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { ACCEPT_ATTRIBUTE, validateMediaFile } from "@/lib/media";

/**
 * Gallery photo upload form with drag & drop, title, description, and category fields.
 */
export function GalleryUploadForm(): React.ReactNode {
  const router = useRouter();
  const uploadPhoto = useUploadPhoto();
  const { data: albums } = useAdminAlbums();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // "files" uploads local media; "link" embeds a YouTube/Vimeo video (no upload,
  // so it sidesteps the 100 MB ceiling for heavy event videos).
  const [mode, setMode] = useState<"files" | "link">("files");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [embedUrl, setEmbedUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const incoming = Array.from(newFiles);
    // Validate each file's type and per-kind size (images 5 Mo, vidéos 100 Mo).
    // Reject the whole batch on the first invalid file so the user gets a clear
    // message rather than a silently dropped file.
    for (const f of incoming) {
      const check = validateMediaFile(f);
      if (!check.ok) {
        setError(`${f.name} : ${check.error}`);
        return;
      }
    }
    if (incoming.length === 0) {
      setError("Formats acceptés : JPG, PNG, WebP, GIF, MP4");
      return;
    }
    setError(null);
    setFiles(incoming);
    setPreviews(incoming.map((f) => URL.createObjectURL(f)));
  }, []);

  function handleDrop(e: React.DragEvent): void {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent): void {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(): void {
    setDragOver(false);
  }

  function removeFile(index: number): void {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  /** Shared metadata fields appended to every upload request. */
  function appendMeta(formData: FormData): void {
    if (description) formData.append("description", description);
    if (category) formData.append("category", category);
    if (albumId) formData.append("albumId", albumId);
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }
    if (mode === "files" && files.length === 0) {
      setError("Veuillez sélectionner au moins une photo");
      return;
    }
    if (mode === "link" && !embedUrl.trim()) {
      setError("Veuillez coller un lien YouTube ou Vimeo");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      if (mode === "link") {
        const formData = new FormData();
        formData.append("embedUrl", embedUrl.trim());
        formData.append("title", title);
        appendMeta(formData);
        await uploadPhoto.mutateAsync(formData);
      } else {
        for (let i = 0; i < files.length; i++) {
          const formData = new FormData();
          formData.append("file", files[i]);
          formData.append("title", files.length > 1 ? `${title} (${i + 1})` : title);
          appendMeta(formData);
          await uploadPhoto.mutateAsync(formData);
          setUploadProgress(i + 1);
        }
      }
      router.push("/admin/gallery");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode toggle: local files vs external video link */}
      <div className="inline-flex rounded-md border border-border p-1">
        <button
          type="button"
          onClick={() => setMode("files")}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "files" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          Fichiers
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "link" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          Lien vidéo (YouTube/Vimeo)
        </button>
      </div>

      {mode === "files" && (
        <>
          {/* Drag & drop zone */}
          <div>
            <Label>Photos et vidéos</Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-2 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Glissez-déposez vos photos ou vidéos ici ou cliquez pour sélectionner
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Images JPG, PNG, WebP, GIF (5 Mo max) — Vidéos MP4 (100 Mo max)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_ATTRIBUTE}
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {previews.map((src, i) => (
                <div key={src} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                  {files[i]?.type.startsWith("video/") ? (
                    // Local blob preview: a <video> shows the first frame; next/image
                    // can't render video, so it's used only for image files.
                    <video
                      src={src}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <Image
                      src={src}
                      alt={`Aperçu ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {mode === "link" && (
        <div>
          <Label htmlFor="embedUrl">Lien de la vidéo</Label>
          <Input
            id="embedUrl"
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="https://youtu.be/xxxxxxxx"
            className="mt-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Collez un lien YouTube ou Vimeo. Idéal pour les vidéos lourdes
            (&gt; 100 Mo) : la vidéo reste hébergée chez le fournisseur, le site
            n&apos;héberge que le lien. Mettez la vidéo en « Non répertoriée » sur
            YouTube pour qu&apos;elle ne soit visible que depuis le site.
          </p>
        </div>
      )}

      {/* Title */}
      <div>
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la photo / série"
          className="mt-2"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description (optionnel)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description de la photo..."
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Album (event folder) */}
      <div>
        <Label htmlFor="album">Album / événement (optionnel)</Label>
        <select
          id="album"
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
          className="mt-2 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="">— Aucun album —</option>
          {albums?.map((album) => (
            <option key={album.id} value={album.id}>
              {album.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Les albums se gèrent depuis la page Galerie de l&apos;administration.
        </p>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Catégorie (optionnel)</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="ex: Course, Entraînement, Social..."
          className="mt-2"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Progress */}
      {uploading && files.length > 1 && (
        <div className="text-sm text-muted-foreground">
          Upload en cours : {uploadProgress}/{files.length} photos
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={
            uploading ||
            (mode === "files" && files.length === 0) ||
            (mode === "link" && !embedUrl.trim())
          }
        >
          {uploading ? (
            <>
              <ImageIcon className="mr-2 h-4 w-4 animate-pulse" />
              {mode === "link" ? "Ajout en cours..." : "Upload en cours..."}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {mode === "link"
                ? "Ajouter la vidéo"
                : files.length > 1
                  ? `Uploader ${files.length} photos`
                  : "Uploader la photo"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/gallery")}
          disabled={uploading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
