import { stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { slugify } from "transliteration";
import type { MetadataEntry, MetadataStore } from "../types";
import { readJsonFile, writeJsonFile, ensureDir } from "../utils/fs";

const METADATA_FILE = "metadata.json";

export const loadMetadata = async (dataDir: string): Promise<MetadataStore> => {
  const filePath = join(dataDir, METADATA_FILE);
  return (await readJsonFile<MetadataStore>(filePath)) ?? {};
};

export const saveMetadata = async (
  dataDir: string,
  store: MetadataStore
): Promise<void> => {
  await ensureDir(dataDir);
  await writeJsonFile(join(dataDir, METADATA_FILE), store);
};

const titleFromFilename = (filename: string): string => {
  return basename(filename, ".md").replace(/[-_]/g, " ");
};

export const syncMetadata = async (
  dataDir: string,
  contentDir: string,
  diskFiles: string[],
  store: MetadataStore
): Promise<MetadataStore> => {
  const updated = { ...store };

  // Remove entries for files no longer on disk
  for (const key of Object.keys(updated)) {
    if (!diskFiles.includes(key)) {
      delete updated[key];
    }
  }

  // Add entries for new files
  for (const relPath of diskFiles) {
    if (!updated[relPath]) {
      const absPath = join(contentDir, relPath);
      let createdAt: string;
      let updatedAt: string;
      try {
        const fileStat = await stat(absPath);
        createdAt = fileStat.birthtime.toISOString();
        updatedAt = fileStat.mtime.toISOString();
      } catch {
        const now = new Date().toISOString();
        createdAt = now;
        updatedAt = now;
      }

      const title = titleFromFilename(relPath);

      updated[relPath] = {
        title,
        created: createdAt,
        updated: updatedAt,
        slug: slugify(title, { separator: "-" }),
        tags: [],
        description: "",
      };
    }
  }

  await saveMetadata(dataDir, updated);
  return updated;
};
