import { BlogCard } from "./BlogCard";
import type { BlogPost } from "@/types";

interface BlogGridProps {
  posts: BlogPost[];
}

/**
 * Responsive grid of BlogCard components
 */
export function BlogGrid({ posts }: BlogGridProps): React.ReactNode {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>Aucun article disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
