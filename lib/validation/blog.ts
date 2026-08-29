import { z } from "zod";

export const createBlogPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(100).optional(),
  excerpt: z.string().trim().min(1).max(400),
  content: z.string().trim().min(1),
  coverImageUrl: z.string().trim().url().optional().nullable(),
  category: z.string().trim().max(60).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  seoTitle: z.string().trim().max(70).optional().nullable(),
  seoDescription: z.string().trim().max(160).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();
