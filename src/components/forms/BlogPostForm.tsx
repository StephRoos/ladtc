"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  blogPostSchema,
  BLOG_CATEGORIES,
  CATEGORY_TO_EVENT_TYPE,
  type BlogPostFormData,
  type BlogCategory,
} from "@/lib/schemas";
import { slugify } from "@/lib/utils";
import { ImageIcon, Upload, Link, X, CalendarDays, Info } from "lucide-react";

interface BlogPostFormProps {
  defaultValues?: Partial<BlogPostFormData>;
  onSubmit: (data: BlogPostFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

/**
 * Blog post create/edit form.
 * Uses React Hook Form + Zod validation with auto-slug generation.
 * Supports both URL input and local file upload for featured image.
 * Shows conditional event fields (date, location) when an event-related category is selected.
 */
export function BlogPostForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  error,
}: BlogPostFormProps): React.ReactNode {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      published: false,
      tags: [],
      ...defaultValues,
    },
  });

  const submitting = isSubmitting || formSubmitting;
  const title = watch("title");
  const featuredImageUrl = watch("featuredImageUrl");
  const category = watch("category");
  const isEditing = !!defaultValues?.slug;

  const isEventCategory =
    category != null &&
    BLOG_CATEGORIES.includes(category as BlogCategory) &&
    CATEGORY_TO_EVENT_TYPE[category as BlogCategory] !== null;

  const [imageMode, setImageMode] = useState<"url" | "upload">(
    defaultValues?.featuredImageUrl ? "url" : "upload"
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultValues?.featuredImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing && title) {
      setValue("slug", slugify(title));
    }
  }, [title, isEditing, setValue]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

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

      setValue("featuredImageUrl", data.url);
      setPreviewUrl(data.url);
    } catch {
      setUploadError("Erreur réseau lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  function handleClearImage(): void {
    setValue("featuredImageUrl", "");
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const url = e.target.value;
    setValue("featuredImageUrl", url);
    setPreviewUrl(url || null);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          placeholder="Mon article de blog"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          placeholder="mon-article-de-blog"
          {...register("slug")}
        />
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenu (Markdown)</Label>
        <textarea
          id="content"
          rows={15}
          placeholder="Rédigez votre article en Markdown..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
          {...register("content")}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Extrait (optionnel)</Label>
        <textarea
          id="excerpt"
          rows={3}
          placeholder="Court résumé de l'article..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register("excerpt")}
        />
        {errors.excerpt && (
          <p className="text-sm text-destructive">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <Select
            value={category ?? ""}
            onValueChange={(value) =>
              setValue("category", value || undefined)
            }
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {BLOG_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
          <Input
            id="tags"
            placeholder="trail, formation, compétition"
            defaultValue={defaultValues?.tags?.join(", ") ?? ""}
            onChange={(e) => {
              const tags = e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              setValue("tags", tags);
            }}
          />
          {errors.tags && (
            <p className="text-sm text-destructive">{errors.tags.message}</p>
          )}
        </div>
      </div>

      {/* Conditional event fields */}
      {isEventCategory && (
        <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Info className="h-4 w-4" />
            <span>
              Cet article sera affiché dans la section Événements s&apos;il a
              une date d&apos;événement.
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Date de l&apos;événement
              </Label>
              <Input
                id="eventDate"
                type="datetime-local"
                defaultValue={
                  defaultValues?.eventDate
                    ? defaultValues.eventDate.slice(0, 16)
                    : ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setValue(
                    "eventDate",
                    val ? new Date(val).toISOString() : null
                  );
                }}
              />
              {errors.eventDate && (
                <p className="text-sm text-destructive">
                  {errors.eventDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventLocation">Lieu</Label>
              <Input
                id="eventLocation"
                placeholder="Bois de la Cambre, Bruxelles"
                defaultValue={defaultValues?.eventLocation ?? ""}
                onChange={(e) =>
                  setValue("eventLocation", e.target.value || null)
                }
              />
              {errors.eventLocation && (
                <p className="text-sm text-destructive">
                  {errors.eventLocation.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Featured image: URL or file upload */}
      <div className="space-y-3">
        <Label>Image de couverture</Label>

        <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
          <button
            type="button"
            onClick={() => setImageMode("upload")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              imageMode === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Uploader
          </button>
          <button
            type="button"
            onClick={() => setImageMode("url")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              imageMode === "url"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link className="h-3.5 w-3.5" />
            URL
          </button>
        </div>

        {imageMode === "upload" ? (
          <div className="space-y-2">
            <div
              className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
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
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://exemple.com/image.jpg"
              value={featuredImageUrl || ""}
              onChange={handleUrlChange}
            />
          </div>
        )}

        {errors.featuredImageUrl && (
          <p className="text-sm text-destructive">{errors.featuredImageUrl.message}</p>
        )}

        {/* Image preview */}
        {previewUrl && (
          <div className="relative w-full max-w-sm">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="rounded-lg border border-border object-cover w-full aspect-video"
              onError={() => setPreviewUrl(null)}
            />
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Hidden input to register the field with react-hook-form */}
        <input type="hidden" {...register("featuredImageUrl")} />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="published"
          type="checkbox"
          className="h-4 w-4 rounded border-border"
          defaultChecked={defaultValues?.published ?? false}
          {...register("published")}
        />
        <Label htmlFor="published">Publier l&apos;article</Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
