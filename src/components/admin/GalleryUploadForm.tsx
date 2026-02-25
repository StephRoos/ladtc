"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadPhoto } from "@/hooks/use-gallery";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

/**
 * Gallery photo upload form with drag & drop, title, description, and category fields.
 */
export function GalleryUploadForm(): React.ReactNode {
  const router = useRouter();
  const uploadPhoto = useUploadPhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter((f) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type)
    );
    if (validFiles.length === 0) {
      setError("Formats acceptés : JPG, PNG, WebP, GIF");
      return;
    }
    setError(null);
    setFiles(validFiles);
    setPreviews(validFiles.map((f) => URL.createObjectURL(f)));
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

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (files.length === 0) {
      setError("Veuillez sélectionner au moins une photo");
      return;
    }
    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("title", files.length > 1 ? `${title} (${i + 1})` : title);
        if (description) formData.append("description", description);
        if (category) formData.append("category", category);

        await uploadPhoto.mutateAsync(formData);
        setUploadProgress(i + 1);
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
      {/* Drag & drop zone */}
      <div>
        <Label>Photos</Label>
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
            Glissez-déposez vos photos ici ou cliquez pour sélectionner
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, WebP, GIF — 5 Mo max par fichier
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
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
              <Image
                src={src}
                alt={`Aperçu ${i + 1}`}
                fill
                className="object-cover"
              />
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
        <Button type="submit" disabled={uploading || files.length === 0}>
          {uploading ? (
            <>
              <ImageIcon className="mr-2 h-4 w-4 animate-pulse" />
              Upload en cours...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {files.length > 1
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
