"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { BlogGrid } from "@/components/cards/BlogGrid";
import { useBlogPosts } from "@/hooks/use-blog-posts";

const PER_PAGE = 9;

function BlogListSkeleton(): React.ReactNode {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PER_PAGE }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/**
 * Blog list page — paginated list of published blog posts
 */
export default function BlogPage(): React.ReactNode {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data, isLoading, isError } = useBlogPosts(
    page,
    PER_PAGE,
    debouncedSearch || undefined
  );

  function handleSearchChange(value: string): void {
    setSearch(value);
    setPage(1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Actualités, comptes-rendus de courses et vie du club
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && <BlogListSkeleton />}

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
          <p className="font-medium text-destructive">
            Impossible de charger les articles
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Veuillez vérifier votre connexion et réessayer.
          </p>
        </div>
      )}

      {data && (
        <>
          <BlogGrid posts={data.posts} />

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} sur {data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Suivant →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
