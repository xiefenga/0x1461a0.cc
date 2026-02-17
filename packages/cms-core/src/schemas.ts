import { z } from "zod";

export const MetadataEntrySchema = z.object({
  title: z.string().min(1),
  slug: z.string(),
  tags: z.array(z.string()),
  description: z.string(),
  created: z.string().datetime(),
  updated: z.string().datetime(),
});
