import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ladtc.be";

/**
 * Dynamic sitemap — lists all public routes and published content.
 * Next.js serves this at /sitemap.xml automatically.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/events`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/equipment`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/team`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/gallery`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Published blog posts
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    });
    blogEntries = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Database unavailable during build — return static pages only
  }

  // Active products
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, updatedAt: true },
    });
    productEntries = products.map((product) => ({
      url: `${BASE_URL}/equipment/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {
    // Database unavailable during build
  }

  return [...staticPages, ...blogEntries, ...productEntries];
}
