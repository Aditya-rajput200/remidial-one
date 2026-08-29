import "server-only";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/blog/slugify-client";

export { slugify };

/** Appends -2, -3, ... until the slug is free, excluding `excludeId` (the post's own id, for edits). */
export async function uniqueBlogSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "post";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
