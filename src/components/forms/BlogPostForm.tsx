"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { CalendarDays, Info } from "lucide-react";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { GalleryMediaPicker } from "@/components/admin/GalleryMediaPicker";
import type { GalleryPhoto } from "@/types";

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
    control,
    setValue,
    getValues,
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
  const title = useWatch({ control, name: "title" });
  const featuredImageUrl = useWatch({ control, name: "featuredImageUrl" });
  const category = useWatch({ control, name: "category" });
  const isEditing = !!defaultValues?.slug;

  const isEventCategory =
    category != null &&
    BLOG_CATEGORIES.includes(category as BlogCategory) &&
    CATEGORY_TO_EVENT_TYPE[category as BlogCategory] !== null;

  useEffect(() => {
    if (!isEditing && title) {
      setValue("slug", slugify(title));
    }
  }, [title, isEditing, setValue]);

  // Merge RHF's ref with our own so we can insert text at the caret position.
  const { ref: contentFieldRef, ...contentField } = register("content");
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  /**
   * Insert a gallery media reference into the content textarea at the caret.
   * Images become Markdown image syntax; videos become a bare /uploads URL on
   * its own line, which the blog renderer turns into a <video> player.
   */
  function insertGalleryMedia(media: GalleryPhoto): void {
    const snippet =
      media.mediaType === "VIDEO"
        ? media.url // bare URL on its own line → rendered as a video player
        : `![${media.title}](${media.url})`;

    const textarea = contentRef.current;
    const current = getValues("content") ?? "";

    // Without a live textarea reference, fall back to appending.
    if (!textarea) {
      const next = current ? `${current}\n\n${snippet}\n` : `${snippet}\n`;
      setValue("content", next, { shouldDirty: true, shouldValidate: true });
      return;
    }

    const start = textarea.selectionStart ?? current.length;
    const end = textarea.selectionEnd ?? current.length;
    const before = current.slice(0, start);
    const after = current.slice(end);

    // Ensure the snippet sits on its own paragraph (blank line before/after),
    // which is required for the video URL to be detected as an embed.
    const prefix = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    const suffix = after.startsWith("\n\n") || after.length === 0 ? "" : after.startsWith("\n") ? "\n" : "\n\n";
    const insertion = `${prefix}${snippet}${suffix}`;
    const next = before + insertion + after;

    setValue("content", next, { shouldDirty: true, shouldValidate: true });

    // Restore focus and place the caret right after the inserted snippet.
    requestAnimationFrame(() => {
      const caret = before.length + insertion.length;
      textarea.focus();
      textarea.setSelectionRange(caret, caret);
    });
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
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="content">Contenu (Markdown)</Label>
          <GalleryMediaPicker onSelect={insertGalleryMedia} />
        </div>
        <textarea
          id="content"
          rows={15}
          placeholder="Rédigez votre article en Markdown..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
          ref={(el) => {
            contentFieldRef(el);
            contentRef.current = el;
          }}
          {...contentField}
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

      {/* Featured image */}
      <div className="space-y-2">
        <Label>Image de couverture</Label>
        <ImagePicker
          value={featuredImageUrl || undefined}
          onSelect={(url) => setValue("featuredImageUrl", url)}
          onClear={() => setValue("featuredImageUrl", "")}
        />
        {errors.featuredImageUrl && (
          <p className="text-sm text-destructive">{errors.featuredImageUrl.message}</p>
        )}
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
