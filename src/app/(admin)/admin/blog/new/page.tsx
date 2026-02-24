"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateBlogPost } from "@/hooks/use-blog-posts";
import { BlogPostForm } from "@/components/forms/BlogPostForm";
import type { BlogPostFormData } from "@/lib/schemas";

/**
 * Admin create blog post page.
 */
export default function NewBlogPostPage(): React.ReactNode {
  const router = useRouter();
  const createBlogPost = useCreateBlogPost();

  async function handleSubmit(data: BlogPostFormData): Promise<void> {
    await createBlogPost.mutateAsync(data);
    router.push("/admin/blog");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/admin/blog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Retour aux articles
      </Link>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Nouvel article</h1>
      <BlogPostForm
        onSubmit={handleSubmit}
        isSubmitting={createBlogPost.isPending}
        error={createBlogPost.error?.message}
      />
    </div>
  );
}
