import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize";
import { uniqueBlogSlug } from "@/lib/blog/slugify";
import { updateBlogPostSchema } from "@/lib/validation/blog";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("cms.read");
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("cms.update");
    const { id } = await params;
    const body = updateBlogPostSchema.parse(await request.json());

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isPublishing = body.status === "PUBLISHED" && existing.status !== "PUBLISHED";
    if (body.status === "PUBLISHED") {
      await requirePermission("cms.publish");
    }

    // A title edit alone doesn't change the slug — leave it alone so
    // published links don't silently break; only an explicit slug edit does.
    const slug = body.slug && body.slug !== existing.slug ? await uniqueBlogSlug(body.slug, id) : existing.slug;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        slug,
        ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
        ...(body.content !== undefined ? { content: sanitizeBlogHtml(body.content) } : {}),
        ...(body.coverImageUrl !== undefined ? { coverImageUrl: body.coverImageUrl } : {}),
        ...(body.category !== undefined ? { category: body.category } : {}),
        ...(body.tags !== undefined ? { tags: body.tags } : {}),
        ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
        ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(isPublishing ? { publishedAt: new Date() } : {}),
      },
    });

    await recordAuditLog({
      actorId: user.id,
      action: isPublishing ? "BLOG_POST_PUBLISHED" : "BLOG_POST_UPDATED",
      resourceType: "BlogPost",
      resourceId: post.id,
    });

    return NextResponse.json({ post });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("cms.update");
    const { id } = await params;

    const existing = await prisma.blogPost.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id } });

    await recordAuditLog({
      actorId: user.id,
      action: "BLOG_POST_DELETED",
      resourceType: "BlogPost",
      resourceId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
