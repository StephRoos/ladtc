import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

/** Number of posts returned per page. */
const PAGE_SIZE = 50;

/**
 * GET /api/member/social-posts
 * Returns SocialPosts (club Facebook group wall) in reverse chronological
 * order. Requires an authenticated session (member space).
 * Query params: cursor (id of the last post for pagination).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const cursorId = request.nextUrl.searchParams.get("cursor");

  const posts = await prisma.socialPost.findMany({
    orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }],
    take: PAGE_SIZE,
    ...(cursorId
      ? {
          cursor: { id: cursorId },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      authorName: true,
      content: true,
      mediaUrls: true,
      permalink: true,
      postedAt: true,
    },
  });

  const hasMore = posts.length === PAGE_SIZE;
  const nextCursor = hasMore ? posts[posts.length - 1].id : null;

  return NextResponse.json({ posts, nextCursor });
}
