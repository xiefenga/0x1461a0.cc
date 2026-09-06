import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { CONTENT_LOADER_BASE } from "astro:env/server";

const blog = defineCollection({
  loader: glob({ base: CONTENT_LOADER_BASE, pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    tags: z.array(z.string()).default([]),
    description: z.string().default(""),
    created: z.coerce.date(),
    updated: z.coerce.date(),
  }),
});

export const collections = { blog };
