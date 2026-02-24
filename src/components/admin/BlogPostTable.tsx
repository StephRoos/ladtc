"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteBlogPost } from "@/hooks/use-blog-posts";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

interface BlogPostTableProps {
  posts: BlogPost[];
  isLoading?: boolean;
}

/**
 * Blog posts table for admin management with edit and delete actions.
 */
export function BlogPostTable({
  posts,
  isLoading = false,
}: BlogPostTableProps): React.ReactNode {
  const deleteBlogPost = useDeleteBlogPost();

  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
        Aucun article trouvé.
      </div>
    );
  }

  async function handleDelete(id: string, title: string): Promise<void> {
    if (!confirm(`Supprimer l'article « ${title} » ?`)) return;
    await deleteBlogPost.mutateAsync(id);
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Auteur</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium max-w-[300px] truncate">
                {post.title}
              </TableCell>
              <TableCell>{post.author.name ?? "—"}</TableCell>
              <TableCell>{post.category ?? "—"}</TableCell>
              <TableCell>
                {post.published ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border text-xs">
                    Publié
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border text-xs">
                    Brouillon
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {post.publishedAt
                  ? formatDate(post.publishedAt)
                  : formatDate(post.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/blog/${post.id}`}>Modifier</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(post.id, post.title)}
                    disabled={deleteBlogPost.isPending}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
