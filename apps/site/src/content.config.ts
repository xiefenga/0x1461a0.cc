import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { CONTENT_LOADER_BASE } from "astro:env/server";

const blog = defineCollection({
  loader: glob({ base: CONTENT_LOADER_BASE, pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      created: z.coerce.date(),
      updated: z.coerce.date(),
    }),
});

export const collections = { blog };
