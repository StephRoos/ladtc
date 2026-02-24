"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { marked } from "marked";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPost } from "@/hooks/use-blog-posts";
import { formatDate } from "@/lib/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function BlogPostSkeleton(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Single blog post detail page — renders full article with Markdown content
 */
export default function BlogPostPage({ params }: BlogPostPageProps): React.ReactNode {
  const { slug } = use(params);
  const { data: post, isLoading, isError } = useBlogPost(slug);

  const htmlContent = post?.content ? marked.parse(post.content) : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Button asChild variant="ghost" className="mb-8 -ml-4">
        <Link href="/blog">← Retour au blog</Link>
      </Button>

      {isLoading && <BlogPostSkeleton />}

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
          <p className="font-medium text-destructive">
            Impossible de charger l&apos;article
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Veuillez vérifier votre connexion et réessayer.
          </p>
        </div>
      )}

      {post === null && !isLoading && (
        <div className="py-16 text-center">
          <p className="text-2xl font-bold">Article introuvable</p>
          <p className="mt-2 text-muted-foreground">
            Cet article n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild className="mt-6">
            <Link href="/blog">Retour au blog</Link>
          </Button>
        </div>
      )}

      {post && (
        <article>
          {/* Category */}
          {post.category && (
            <div className="mb-4">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary"
              >
                {post.category}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Par {post.author.name ?? "LADTC"}</span>
            <span>·</span>
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            )}
          </div>

          {/* Featured image */}
          {post.featuredImageUrl && (
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={post.featuredImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
          )}

          {/* Content (Markdown rendered to HTML) */}
          <div
            className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
              <span className="text-sm text-muted-foreground">Tags :</span>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </article>
      )}
    </div>
  );
}
