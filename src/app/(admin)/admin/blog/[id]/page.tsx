"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdminBlogPost, useUpdateBlogPost } from "@/hooks/use-blog-posts";
import { BlogPostForm } from "@/components/forms/BlogPostForm";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlogPostFormData } from "@/lib/schemas";

/**
 * Admin edit blog post page.
 */
export default function EditBlogPostPage(): React.ReactNode {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useAdminBlogPost(id);
  const updateBlogPost = useUpdateBlogPost();

  async function handleSubmit(formData: BlogPostFormData): Promise<void> {
    await updateBlogPost.mutateAsync({ id, data: formData });
    router.push("/admin/blog");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data?.post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-muted-foreground">Article introuvable.</p>
        <Link
          href="/admin/blog"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Retour aux articles
        </Link>
      </div>
    );
  }

  const { post } = data;
  const defaultValues: BlogPostFormData = {
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt ?? undefined,
    featuredImageUrl: post.featuredImageUrl ?? "",
    category: post.category ?? undefined,
    tags: post.tags,
    published: post.published,
    eventDate: post.eventDate ?? undefined,
    eventLocation: post.eventLocation ?? undefined,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/admin/blog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Retour aux articles
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Modifier l&apos;article</h1>
      <BlogPostForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={updateBlogPost.isPending}
        error={updateBlogPost.error?.message}
      />
    </div>
  );
}
