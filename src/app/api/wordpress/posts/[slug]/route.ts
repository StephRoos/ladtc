import { NextRequest, NextResponse } from "next/server";
import { fetchBlogPostBySlug } from "@/lib/wordpress";

/**
 * GET /api/wordpress/posts/[slug]
 * Proxy to WordPress REST API — returns a single blog post by slug
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  try {
    const post = await fetchBlogPostBySlug(slug);
    if (!post) {
      return NextResponse.json(
        { error: "Article introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("WordPress proxy error:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer l'article depuis WordPress" },
      { status: 500 }
    );
  }
}
