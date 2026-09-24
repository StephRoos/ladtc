"use client";

import { useRequireAuth } from "@/hooks/use-auth";
import { useSocialPosts } from "@/hooks/use-social-posts";
import { SocialPostCard } from "@/components/cards/SocialPostCard";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Member wall — "Le fil du club" (/fil).
 * Displays all imported posts from the club's private Facebook group in
 * reverse chronological order. Authentication enforced client-side via
 * useRequireAuth (same pattern as the rest of the member space).
 */
export default function FilPage(): React.ReactNode {
  const { isLoading: authLoading } = useRequireAuth();
  const { data, isLoading: postsLoading, isError } = useSocialPosts();

  const isLoading = authLoading || postsLoading;

  return (
    <div className="mx-auto max-w-xl space-y-5 px-4 py-8">
      <div className="mb-1">
        <h1 className="text-2xl font-bold">Le fil du club</h1>
        <p className="text-sm text-muted-foreground">
          Les publications du groupe Facebook des membres, réservées au club.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {isError && (
        <p className="py-10 text-center text-muted-foreground">
          Impossible de charger le fil. Veuillez réessayer.
        </p>
      )}

      {data && data.posts.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          Aucune publication pour le moment.
        </p>
      )}

      {data?.posts.map((post) => (
        <SocialPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
