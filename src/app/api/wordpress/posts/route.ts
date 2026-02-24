import { NextRequest, NextResponse } from "next/server";
import { fetchBlogPosts } from "@/lib/wordpress";

/**
 * GET /api/wordpress/posts
 * Proxy to WordPress REST API — returns paginated blog posts
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const perPage = parseInt(searchParams.get("per_page") ?? "10", 10);

  try {
    const data = await fetchBlogPosts(page, perPage);
    return NextResponse.json(data);
  } catch (error) {
    console.error("WordPress proxy error:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les articles depuis WordPress" },
      { status: 500 }
    );
  }
}
