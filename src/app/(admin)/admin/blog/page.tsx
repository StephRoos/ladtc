"use client";

import Link from "next/link";
import { useAdminBlogPosts } from "@/hooks/use-blog-posts";
import { BlogPostTable } from "@/components/admin/BlogPostTable";
import { Button } from "@/components/ui/button";

/**
 * Admin blog posts management page.
 */
export default function AdminBlogPage(): React.ReactNode {
  const { data, isLoading, isError } = useAdminBlogPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Blog</h1>
        <Button asChild>
          <Link href="/admin/blog/new">Nouvel article</Link>
        </Button>
      </div>

      {isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-4 text-destructive">
          Impossible de charger les articles.
        </div>
      ) : (
        <BlogPostTable posts={data?.posts ?? []} isLoading={isLoading} />
      )}
    </div>
  );
}
