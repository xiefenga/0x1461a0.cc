import { join } from "node:path";

import { buildIndex } from "./indexer";
import { getDataDir } from "../config/loader";
import { validateEntities } from "./validator";
import { computeChangeSet, findRemoved } from "./diff";
import {
  loadMetadata,
  saveMetadata,
  syncMetadata,
} from "./metadata";
import { scanContentDir, buildEntities } from "./scanner";
import { readJsonFile, writeJsonFile, ensureDir } from "../utils/fs";
import { MetadataEntrySchema } from "../schemas";

import type { Config } from "../config/schema";
import type {
  ChangeSet,
  ContentEntity,
  ContentIndex,
  Manifest,
  MetadataEntry,
  ValidationResult,
} from "../types";

const MANIFEST_FILE = "manifest.json";
const INDEX_FILE = "index.json";
const PATH_MAP_FILE = "path-map.json";

export class ContentManager {
  private config: Config;
  private readonly dataDir: string;
  private entities: ContentEntity[] = [];

  constructor(config: Config) {
    this.config = config;
    this.dataDir = getDataDir(config.contentDir);
  }

  async init(): Promise<void> {
    await ensureDir(this.dataDir);
  }

  async scan(): Promise<ContentEntity[]> {
    const files = await scanContentDir(
      this.config.contentDir,
      this.config.patterns
    );

    const store = await loadMetadata(this.dataDir);
    const synced = await syncMetadata(this.dataDir, this.config.contentDir, files, store);

    this.entities = await buildEntities(this.config.contentDir, files, synced);

    return this.entities;
  }

  async getChangeSet(): Promise<ChangeSet> {
    const manifest = await this.loadManifest();
    const pathMap =
      (await readJsonFile<Record<string, string>>(
        join(this.dataDir, PATH_MAP_FILE)
      )) ?? {};

    const changeSet = computeChangeSet(this.entities, manifest);
    changeSet.removed = findRemoved(this.entities, manifest, pathMap);

    return changeSet;
  }

  async updateManifest(): Promise<void> {
    const manifest: Manifest = {};
    for (const entity of this.entities) {
      manifest[entity.id] = entity.hash;
    }
    await writeJsonFile(join(this.dataDir, MANIFEST_FILE), manifest);

    // Update path map as well
    const pathMap: Record<string, string> = {};
    for (const e of this.entities) {
      pathMap[e.id] = e.path;
    }
    await writeJsonFile(join(this.dataDir, PATH_MAP_FILE), pathMap);
  }

  async resetManifest(): Promise<void> {
    await writeJsonFile(join(this.dataDir, MANIFEST_FILE), {});
    await writeJsonFile(join(this.dataDir, PATH_MAP_FILE), {});
  }

  async rebuildIndex(): Promise<ContentIndex> {
    const index = buildIndex(this.entities);
    // Store a serializable version (without body for index file)
    const serializable = {
      byId: mapValues(index.byId, stripBody),
      bySlug: mapValues(index.bySlug, stripBody),
      byTag: mapValues(index.byTag, (arr) => arr.map(stripBody)),
      sortedByDate: index.sortedByDate.map(stripBody),
    };
    await writeJsonFile(join(this.dataDir, INDEX_FILE), serializable);
    return index;
  }

  validate(): ValidationResult {
    return validateEntities(this.entities, {
      allowSourceFrontmatter:
        this.config.frontmatter?.policy === "preserve",
    });
  }

  async updateMetadata(
    path: string,
    patch: Partial<MetadataEntry>
  ): Promise<ContentEntity> {
    const store = await loadMetadata(this.dataDir);
    const current = store[path];

    if (!current) {
      throw new Error(
        `Metadata not found for "${path}". Run scan before editing metadata.`
      );
    }

    const metadata = MetadataEntrySchema.parse({
      ...current,
      ...patch,
      updated: patch.updated ?? new Date().toISOString(),
    });

    store[path] = metadata;
    await saveMetadata(this.dataDir, store);
    await this.scan();

    const entity = this.entities.find((entry) => entry.path === path);
    if (!entity) {
      throw new Error(`Content file not found after metadata update: ${path}`);
    }
    return entity;
  }

  getEntities(): ContentEntity[] {
    return this.entities;
  }

  private async loadManifest(): Promise<Manifest> {
    return (
      (await readJsonFile<Manifest>(join(this.dataDir, MANIFEST_FILE))) ?? {}
    );
  }
}

const stripBody = (entity: ContentEntity): Omit<ContentEntity, "body"> => {
  const { body: _, ...rest } = entity;
  return rest;
};

const mapValues = <V, R>(obj: Record<string, V>, fn: (v: V) => R): Record<string, R> => {
  const result: Record<string, R> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = fn(v);
  }
  return result;
};
