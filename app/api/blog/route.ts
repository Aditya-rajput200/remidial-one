import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { parsePagination } from "@/lib/api/pagination";
import { errorResponse } from "@/lib/api/respond";
import type { Prisma } from "@/lib/generated/prisma/client";

// Public blog listing — published posts only.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { limit, offset } = parsePagination(searchParams);
    const tag = searchParams.get("tag") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const q = searchParams.get("q")?.trim();

    const where: Prisma.BlogPostWhereInput = {
      status: "PUBLISHED",
      ...(tag ? { tags: { has: tag } } : {}),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [posts, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImageUrl: true,
          category: true,
          tags: true,
          publishedAt: true,
          content: true,
          author: { select: { name: true, avatarUrl: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts: posts.map(({ content, ...post }) => ({
        ...post,
        readTimeMinutes: Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length / 200)),
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
