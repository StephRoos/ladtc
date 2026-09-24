import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { SocialPostItem } from "@/hooks/use-social-posts";

interface SocialPostCardProps {
  post: SocialPostItem;
}

/**
 * Wall card for a club Facebook post — author, date, full text and re-hosted
 * images. Displayed in the member-only wall (/fil). Author identity is shown
 * per decision 6 (private member space).
 */
export function SocialPostCard({ post }: SocialPostCardProps): React.ReactNode {
  const initials =
    post.authorName
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {post.authorName ?? "Membre"}
            </p>
            {post.postedAt && (
              <time
                dateTime={post.postedAt}
                className="text-xs text-muted-foreground"
              >
                {formatDate(post.postedAt)}
              </time>
            )}
          </div>
          {post.permalink && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 text-xs text-muted-foreground transition-colors hover:text-primary"
              title="Voir sur Facebook"
            >
              Facebook ↗
            </a>
          )}
        </div>

        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          {post.content}
        </p>

        {post.mediaUrls.length > 0 && (
          <div
            className={
              post.mediaUrls.length === 1
                ? "mt-3 grid grid-cols-1"
                : "mt-3 grid grid-cols-2 gap-1"
            }
          >
            {post.mediaUrls.map((url) => (
              <div
                key={url}
                className="relative aspect-video w-full overflow-hidden rounded-md bg-muted"
              >
                <Image
                  src={url}
                  alt={`Image du post de ${post.authorName ?? "membre"}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 600px"
                  unoptimized={url.startsWith("/uploads/")}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
