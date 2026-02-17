import { z } from "zod";

export const ConfigSchema = z.object({
  contentDir: z.string().min(1),
  git: z.object({
    remote: z.string().min(1),
    branch: z.string().default("main"),
    cloneDir: z.string().optional(),
  }),
  patterns: z.array(z.string()).default(["**/*.md"]),
});

export type Config = z.infer<typeof ConfigSchema>;
