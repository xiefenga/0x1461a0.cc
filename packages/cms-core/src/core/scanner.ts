import fg from "fast-glob";
import pLimit from "p-limit";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

import { computeHash } from "../utils/hash";
import { generateId, generateSlug } from "../utils/id";

import type { ContentEntity, MetadataStore } from "../types";

const CONCURRENCY = 10;

export const scanContentDir = async (contentDir: string, patterns: string[]): Promise<string[]> => {
  const files = await fg(patterns, {
    cwd: contentDir,
    ignore: [".0xmd/**"],
    onlyFiles: true,
    unique: true,
  });
  return files.sort((a, b) => a.localeCompare(b));
};

export const buildEntities = async (contentDir: string, files: string[], metadata: MetadataStore): Promise<ContentEntity[]> => {
  const limit = pLimit(CONCURRENCY);

  return Promise.all(
    files.map((relPath) =>
      limit(async () => {
        const absPath = join(contentDir, relPath);
        const body = await readFile(absPath, "utf-8");
        const meta = metadata[relPath] ?? { title: relPath };
        const id = generateId(relPath);
        const slug = generateSlug(meta, relPath);
        const hash = computeHash(meta, body);
        return { id, slug, path: relPath, body, metadata: meta, hash };
      })
    )
  );
};
