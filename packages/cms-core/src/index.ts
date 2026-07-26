// Domain types
export {
  type MetadataEntry,
  type MetadataStore,
  type ContentEntity,
  type Manifest,
  type ContentIndex,
  type ChangeSet,
  type ValidationError,
  type ValidationResult,
  type WorkspaceSnapshot,
  type PublishOptions,
  type PublishOutcome,
} from "./types";

// Schemas
export { MetadataEntrySchema } from "./schemas";

// Config
export { ConfigSchema, type Config } from "./config/schema";
export { loadConfig, getConfigPath, getDataDir } from "./config/loader";

// Utils
export { computeHash } from "./utils/hash";
export { generateSlug, generateId } from "./utils/id";
export { hasFrontmatter, injectFrontmatter } from "./utils/markdown";
export {
  atomicWrite,
  ensureDir,
  readJsonFile,
  writeJsonFile,
} from "./utils/fs";

// Core
export { ContentManager } from "./core/content-manager";
export { scanContentDir, buildEntities } from "./core/scanner";
export { computeChangeSet, findRemoved } from "./core/diff";
export { buildIndex } from "./core/indexer";
export {
  validateEntities,
  type ValidationOptions,
} from "./core/validator";
export {
  loadMetadata,
  saveMetadata,
  syncMetadata,
} from "./core/metadata";

// Application service
export {
  CmsService,
  ContentValidationError,
} from "./application/cms-service";

// Storage
export type { StorageAdapter, PublishResult } from "./storage/storage-adapter";
export { GitAdapter } from "./storage/git-adapter";
