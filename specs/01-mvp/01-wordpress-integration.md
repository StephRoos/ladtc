# Spec 01: WordPress Integration — Fetch Blog & Events from API

**Phase**: MVP
**Priority**: 1 (highest)
**Estimated Time**: 8 hours

## Feature

Fetch editorial content (blog posts, events, photos) from the existing WordPress site at `ladtc.be` using the REST API, cache appropriately, and display on the Next.js frontend.

## Goals

- Blog articles display on homepage and dedicated blog page
- Events calendar fetches from WordPress custom post type (or regular posts with category)
- Images and media render with proper optimization
- Graceful error handling if WordPress API is unavailable
- Performance optimized with server-side caching (1 hour) + client-side (TanStack Query)

## User Stories

1. **As a visitor**, I want to see the latest blog posts on the homepage so I can read club news.
2. **As a club member**, I want to view all blog articles in a blog section so I can catch up on past articles.
3. **As a visitor**, I want to click on a blog post to read the full article with author and publication date.
4. **As a member**, I want to see upcoming events from the club calendar (fetched from WordPress).
5. **As a visitor**, I want images to load quickly and display properly on all devices.

## Acceptance Criteria

- [ ] Backend: API route `/api/wordpress/posts` fetches blog posts from WordPress REST API
- [ ] Backend: API route `/api/wordpress/posts/[slug]` fetches single blog post by slug
- [ ] Backend: Proper error handling if WordPress API fails (returns 500 with fallback message)
- [ ] Frontend: Homepage displays 3 latest blog posts in a card grid
- [ ] Frontend: Blog page (`/blog`) displays all posts with pagination (10 per page)
- [ ] Frontend: Blog post detail page (`/blog/[slug]`) renders full article with author, date, featured image
- [ ] Frontend: Featured images optimized with `next/image` (WebP, lazy loading)
- [ ] Frontend: TanStack Query hooks for fetching blog posts with 5-minute staleTime
- [ ] Frontend: Graceful error UI if API fails (shows "Failed to load posts" message)
- [ ] Performance: Blog page loads in < 2 seconds (LCP)
- [ ] Tests: Integration tests for API routes + component tests for blog cards

## Technical Details

### WordPress API Endpoints

The WordPress site at `ladtc.be` exposes:

```
GET https://ladtc.be/wp-json/wp/v2/posts
GET https://ladtc.be/wp-json/wp/v2/posts/{id}
GET https://ladtc.be/wp-json/wp/v2/media
GET https://ladtc.be/wp-json/wp/v2/categories
GET https://ladtc.be/wp-json/wp/v2/tags
```

### Response Format Example

```json
{
  "id": 42,
  "title": { "rendered": "New Training Route" },
  "slug": "new-training-route",
  "content": { "rendered": "<p>Today we...</p>" },
  "excerpt": { "rendered": "Today we opened..." },
  "featured_media": 123,
  "date": "2026-02-20T10:30:00",
  "_embedded": {
    "wp:featuredmedia": [
      {
        "id": 123,
        "source_url": "https://ladtc.be/media/route.jpg",
        "alt_text": "Trail route map"
      }
    ],
    "author": [
      {
        "id": 1,
        "name": "Jean Dupont"
      }
    ]
  }
}
```

### Caching Strategy

**Server-side (Next.js)**:
- Use `next: { revalidate: 3600 }` in fetch options (ISR)
- Revalidate every 1 hour
- On-demand revalidation with `revalidateTag()` if admin publishes new post

**Client-side (TanStack Query)**:
- `staleTime: 5 * 60 * 1000` (5 minutes)
- `gcTime: 10 * 60 * 1000` (10 minutes)
- Manual invalidation after publishing new post (future: via webhook)

### Implementation Files

1. **`src/lib/wordpress.ts`** — API utilities (already created, expand as needed)
   - `fetchBlogPosts(page, perPage)` — List posts
   - `fetchBlogPostBySlug(slug)` — Single post
   - `getFeaturedImageUrl(post)` — Extract image
   - `getAuthorName(post)` — Extract author
   - `stripHtmlTags(html)` — Clean HTML

2. **`src/hooks/useBlogPosts.ts`** (new) — TanStack Query hooks
   - `useBlogPosts(page, perPage)` — List posts with pagination
   - `useBlogPost(slug)` — Single post

3. **`src/components/BlogCard.tsx`** (new) — Blog post card component
4. **`src/components/BlogGrid.tsx`** (new) — Grid of blog cards
5. **`src/app/(public)/blog/page.tsx`** (new) — Blog list page
6. **`src/app/(public)/blog/[slug]/page.tsx`** (new) — Blog detail page
7. **`src/app/api/wordpress/posts/route.ts`** (new) — API proxy endpoint
8. **Tests**: `__tests__/wordpress.test.ts`, `__tests__/BlogCard.test.tsx`

## Database Schema

No database needed for this spec — WordPress is the source of truth.

## API Endpoints

### Backend (Next.js)

```
GET /api/wordpress/posts?page=1&per_page=10
  Response: { posts: BlogPost[], total: number, totalPages: number }

GET /api/wordpress/posts/[slug]
  Response: BlogPost | { error: string }
```

### Frontend Routes

```
GET /blog
  Displays paginated blog list

GET /blog/[slug]
  Displays single blog post detail
```

## Types

```typescript
// In src/types/index.ts

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string | null;
  author: { name: string };
  publishedDate: string;
  categories: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string }>;
}
```

## Testing

### Unit Tests
- `fetchBlogPosts()` returns correct format
- Error handling: API unavailable returns proper error
- HTML entity decoding works

### Integration Tests
- Blog page loads and displays posts
- Blog detail page renders full article
- Pagination works correctly
- Featured images render with `next/image`

### Manual Testing
- Homepage shows latest 3 posts
- Blog page shows all posts with pagination
- Click post to view detail
- Images lazy-load correctly
- Graceful error message if WordPress API is down

## Dependencies

- None — this is the first feature in MVP

## Blockers

- WordPress REST API must be accessible from Next.js (check firewall/CORS if needed)
- Featured media must be embedded in API response (`_embed=true` query param)

## Notes

- This spec can be done in parallel with other MVP specs
- Consider adding a "featured post" concept later (sticky post on homepage)
- Future: Webhook integration for real-time updates when new post is published
- Future: Search functionality for blog posts
