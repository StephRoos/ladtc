import { formatDate } from "@/lib/utils";
import { resolveDirectMediaUrl } from "@/lib/video-embed";
import type { SocialPostItem } from "@/hooks/use-social-posts";

interface SocialPostCardProps {
  post: SocialPostItem;
}

/**
 * Resolve a stored media URL to a directly usable <img> src: Nextcloud public
 * shares are rewritten to their public WebDAV endpoint (like the gallery),
 * other URLs pass through (local /uploads paths, direct links).
 * @param url - Stored media URL
 * @returns Directly usable URL
 */
function mediaSrc(url: string): string {
  return resolveDirectMediaUrl(url)?.url ?? url;
}

/**
 * Wall card for a club Facebook post — author, date, full text and re-hosted
 * images. Displayed in the member-only wall (/fil). Author identity is shown
 * per decision 6 (private member space). Images use natural aspect ratio
 * (no crop): trail photos are often portrait, a fixed ratio cuts them.
 * Media lives on the club Nextcloud (links only, same pattern as the gallery).
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
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            {post.authorName ?? "Membre"}
          </p>
          {post.postedAt && (
            <time
              dateTime={post.postedAt}
              className="text-xs leading-tight text-muted-foreground"
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
            className="shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            title="Voir sur Facebook"
          >
            Facebook ↗
          </a>
        )}
      </div>

      <div className="border-t border-border/60 bg-background/40 px-4 py-3">
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/95">
          {post.content}
        </p>
      </div>

      {post.mediaUrls.length > 0 && (
        <div
          className={
            post.mediaUrls.length === 1
              ? "grid grid-cols-1"
              : "grid grid-cols-2 gap-0.5"
          }
        >
          {post.mediaUrls.map((url) => (
            <div key={url} className="bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- natural aspect ratio for shared Nextcloud media, no optimizer round-trip */}
              <img
                src={mediaSrc(url)}
                alt={`Photo du post de ${post.authorName ?? "membre"}`}
                loading="lazy"
                className={
                  post.mediaUrls.length === 1
                    ? "max-h-[32rem] w-full object-contain"
                    : "aspect-square w-full object-cover"
                }
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
