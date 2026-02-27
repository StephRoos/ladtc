"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGallery } from "@/hooks/use-gallery";
import { ImageIcon, Upload, X, Images, Loader2 } from "lucide-react";

interface ImagePickerProps {
  value?: string;
  onSelect: (url: string) => void;
  onClear?: () => void;
}

/**
 * Universal image picker with upload and gallery selection tabs.
 * Supports drag & drop upload and browsing existing gallery photos.
 */
export function ImagePicker({
  value,
  onSelect,
  onClear,
}: ImagePickerProps): React.ReactNode {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: galleryData, isLoading: galleryLoading } = useGallery(1, 50);

  async function handleFile(file: File): Promise<void> {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Type de fichier non supporté (JPG, PNG, WebP, GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Le fichier dépasse 5 Mo");
      return;
    }

    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Erreur lors de l'upload");
        return;
      }
      onSelect(data.url);
    } catch {
      setUploadError("Erreur réseau lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent): void {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (value) {
    return (
      <div className="relative w-full max-w-sm">
        <img
          src={value}
          alt="Aperçu"
          className="rounded-lg border border-border object-cover w-full aspect-video"
        />
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList>
        <TabsTrigger value="upload" className="flex items-center gap-1.5">
          <Upload className="h-3.5 w-3.5" />
          Uploader
        </TabsTrigger>
        <TabsTrigger value="gallery" className="flex items-center gap-1.5">
          <Images className="h-3.5 w-3.5" />
          Galerie
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <div
          className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading
              ? "Upload en cours..."
              : "Cliquez ou glissez une image ici"}
          </p>
          <p className="text-xs text-muted-foreground/70">
            JPG, PNG, WebP ou GIF — 5 Mo max
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
        </div>
        {uploadError && (
          <p className="mt-2 text-sm text-destructive">{uploadError}</p>
        )}
      </TabsContent>

      <TabsContent value="gallery">
        {galleryLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : galleryData?.photos && galleryData.photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {galleryData.photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => onSelect(photo.url)}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border transition-all hover:border-primary hover:ring-2 hover:ring-primary/20"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border p-6 text-center text-sm text-muted-foreground">
            Aucune photo dans la galerie.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
