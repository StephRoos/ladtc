import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CATEGORY_TO_EVENT_TYPE,
  EVENT_CATEGORIES,
  type BlogCategory,
} from "@/lib/schemas";
import type { EventType } from "@/types";

const PAGE_SIZE = 10;

/**
 * Reverse-lookup: given an EventType, return the blog categories that map to it.
 */
function categoriesForEventType(type: EventType): string[] {
  return EVENT_CATEGORIES.filter(
    (c) => CATEGORY_TO_EVENT_TYPE[c] === type
  );
}

/**
 * GET /api/events
 * Returns a paginated list of upcoming events, merging real Events
 * and qualifying BlogPosts (published, with eventDate in the future
 * and an event-related category). Public endpoint.
 *
 * Query params:
 *   - page: number (default: 1)
 *   - per_page: number (default: 10, max: 50)
 *   - type: EventType filter (optional)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(
    parseInt(searchParams.get("per_page") ?? String(PAGE_SIZE), 10),
    50
  );
  const type = searchParams.get("type");

  const now = new Date();

  // --- Real events ---
  const eventWhere: Record<string, unknown> = {
    date: { gte: now },
  };
  if (type && ["TRAINING", "RACE", "CAMP", "SOCIAL"].includes(type)) {
    eventWhere.type = type;
  }

  // --- Blog-events ---
  const blogWhere: Record<string, unknown> = {
    published: true,
    eventDate: { gte: now },
    category: { in: EVENT_CATEGORIES as unknown as string[] },
  };
  if (type && ["TRAINING", "RACE", "CAMP", "SOCIAL"].includes(type)) {
    const matchingCategories = categoriesForEventType(type as EventType);
    if (matchingCategories.length === 0) {
      // No blog categories match this type — skip blog query
      blogWhere.id = "__none__";
    } else {
      blogWhere.category = { in: matchingCategories };
    }
  }

  const [events, blogPosts] = await Promise.all([
    prisma.event.findMany({
      where: eventWhere,
      orderBy: { date: "asc" },
      include: {
        _count: {
          select: { registrations: { where: { status: "REGISTERED" } } },
        },
      },
    }),
    prisma.blogPost.findMany({
      where: blogWhere,
      orderBy: { eventDate: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImageUrl: true,
        category: true,
        eventDate: true,
        eventLocation: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  // Normalize blog posts to the same shape as events
  const normalizedBlogEvents = blogPosts.map((bp) => ({
    id: bp.id,
    title: bp.title,
    description: bp.excerpt,
    date: bp.eventDate!.toISOString(),
    location: bp.eventLocation ?? "",
    type: CATEGORY_TO_EVENT_TYPE[bp.category as BlogCategory] ?? ("SOCIAL" as const),
    difficulty: null,
    maxParticipants: null,
    createdAt: bp.createdAt.toISOString(),
    updatedAt: bp.updatedAt.toISOString(),
    _count: { registrations: 0 },
    source: "blog-event" as const,
    slug: bp.slug,
    featuredImageUrl: bp.featuredImageUrl,
  }));

  // Normalize real events
  const normalizedEvents = events.map((e) => ({
    ...e,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    source: "event" as const,
    slug: undefined as string | undefined,
    featuredImageUrl: undefined as string | null | undefined,
  }));

  // Merge and sort by date
  const merged = [...normalizedEvents, ...normalizedBlogEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const total = merged.length;
  const skip = (page - 1) * perPage;
  const paginated = merged.slice(skip, skip + perPage);

  return NextResponse.json({
    events: paginated,
    total,
    totalPages: Math.ceil(total / perPage),
  });
}
