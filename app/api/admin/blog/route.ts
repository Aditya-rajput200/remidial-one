import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { parsePagination } from "@/lib/api/pagination";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize";
import { uniqueBlogSlug } from "@/lib/blog/slugify";
import { createBlogPostSchema } from "@/lib/validation/blog";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("cms.read");
    const { searchParams } = request.nextUrl;
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status") ?? undefined;

    const where: Prisma.BlogPostWhereInput = status ? { status: status as Prisma.EnumBlogStatusFilter["equals"] } : {};

    const [posts, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          coverImageUrl: true,
          category: true,
          publishedAt: true,
          updatedAt: true,
          author: { select: { name: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({ posts, total, limit, offset });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("cms.update");
    const body = createBlogPostSchema.parse(await request.json());

    if (body.status === "PUBLISHED") {
      await requirePermission("cms.publish");
    }

    const slug = body.slug ? await uniqueBlogSlug(body.slug) : await uniqueBlogSlug(body.title);

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt,
        content: sanitizeBlogHtml(body.content),
        coverImageUrl: body.coverImageUrl ?? null,
        category: body.category ?? null,
        tags: body.tags,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
        status: body.status,
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
        authorId: user.id,
      },
    });

    await recordAuditLog({
      actorId: user.id,
      action: "BLOG_POST_CREATED",
      resourceType: "BlogPost",
      resourceId: post.id,
      metadata: { status: post.status },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
