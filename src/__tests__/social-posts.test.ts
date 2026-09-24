import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock BetterAuth before importing the route
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    socialPost: {
      findMany: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/member/social-posts/route";

const mockGetSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const mockFindMany = prisma.socialPost.findMany as unknown as ReturnType<typeof vi.fn>;

function makeRequest(searchParams: string = ""): NextRequest {
  return new NextRequest(`http://localhost:3000/api/member/social-posts${searchParams}`);
}

function mockSession(): Record<string, unknown> {
  return {
    user: {
      id: "user-1",
      email: "membre@ladtc.be",
      name: "Test Member",
      image: null,
      role: "MEMBER",
      committeeRole: null,
    },
    session: { id: "session-1", token: "tok" },
  };
}

const samplePosts = [
  {
    id: "post-1",
    authorName: "Max Sagel",
    content: "Qui fait quoi ?",
    mediaUrls: ["/uploads/fil/img.jpg"],
    permalink: "https://www.facebook.com/groups/1355264578348185/posts/1/",
    postedAt: new Date("2025-09-25T12:00:00Z"),
  },
  {
    id: "post-2",
    authorName: "Autre Membre",
    content: "Sortie longue dimanche",
    mediaUrls: [],
    permalink: null,
    postedAt: null,
  },
];

describe("GET /api/member/social-posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated requests", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res).toBeInstanceOf(NextResponse);
    expect(res.status).toBe(401);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns posts for an authenticated member", async () => {
    mockGetSession.mockResolvedValue(mockSession());
    mockFindMany.mockResolvedValue(samplePosts);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      posts: unknown[];
      nextCursor: string | null;
    };
    expect(body.posts).toHaveLength(2);
    expect(body.nextCursor).toBeNull();

    const call = mockFindMany.mock.calls[0][0] as Record<string, unknown>;
    expect(call.orderBy).toEqual([
      { postedAt: "desc" },
      { createdAt: "desc" },
    ]);
  });

  it("passes cursor for pagination", async () => {
    mockGetSession.mockResolvedValue(mockSession());
    const fullPage = Array.from({ length: 50 }, (_, i) => ({
      id: `post-${i}`,
      authorName: null,
      content: "x",
      mediaUrls: [],
      permalink: null,
      postedAt: null,
    }));
    mockFindMany.mockResolvedValue(fullPage);

    const res = await GET(makeRequest("?cursor=post-49"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { nextCursor: string | null };
    expect(body.nextCursor).toBe("post-49");

    const call = mockFindMany.mock.calls[0][0] as Record<string, unknown>;
    expect(call.cursor).toEqual({ id: "post-49" });
    expect(call.skip).toBe(1);
  });

  it("exposes only public-wall fields (no blogPostId leak)", async () => {
    mockGetSession.mockResolvedValue(mockSession());
    mockFindMany.mockResolvedValue(samplePosts);

    const res = await GET(makeRequest());
    const call = mockFindMany.mock.calls[0][0] as { select?: Record<string, boolean> };
    expect(call.select).toBeDefined();
    expect(call.select?.blogPostId).toBeUndefined();
    expect(call.select?.id).toBe(true);
  });
});
