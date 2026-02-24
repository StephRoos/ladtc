"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blogPostSchema, type BlogPostFormData } from "@/lib/schemas";
import { slugify } from "@/lib/utils";

interface BlogPostFormProps {
  defaultValues?: Partial<BlogPostFormData>;
  onSubmit: (data: BlogPostFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

/**
 * Blog post create/edit form.
 * Uses React Hook Form + Zod validation with auto-slug generation.
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
  const isEditing = !!defaultValues?.slug;

  useEffect(() => {
    if (!isEditing && title) {
      setValue("slug", slugify(title));
    }
  }, [title, isEditing, setValue]);

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
          <Input
            id="category"
            placeholder="Trail, Course, Club..."
            {...register("category")}
          />
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

      <div className="space-y-2">
        <Label htmlFor="featuredImageUrl">Image de couverture (URL)</Label>
        <Input
          id="featuredImageUrl"
          type="url"
          placeholder="https://exemple.com/image.jpg"
          {...register("featuredImageUrl")}
        />
        {errors.featuredImageUrl && (
          <p className="text-sm text-destructive">{errors.featuredImageUrl.message}</p>
        )}
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
