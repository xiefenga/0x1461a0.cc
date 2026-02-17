import type { z } from "zod";
import type { MetadataEntrySchema } from "./schemas";

// --- Metadata ---

export type MetadataEntry = z.infer<typeof MetadataEntrySchema>;

/** Maps relative file path -> metadata */
export type MetadataStore = Record<string, MetadataEntry>;

// --- Content Entity ---

export interface ContentEntity {
  id: string;
  slug: string;
  path: string;
  body: string;
  metadata: MetadataEntry;
  hash: string;
}

// --- Manifest ---

/** Maps content id -> hash snapshot */
export type Manifest = Record<string, string>;

// --- Content Index ---

export interface ContentIndex {
  byId: Record<string, ContentEntity>;
  bySlug: Record<string, ContentEntity>;
  byTag: Record<string, ContentEntity[]>;
  sortedByDate: ContentEntity[];
}

// --- ChangeSet ---

export interface ChangeSet {
  added: ContentEntity[];
  updated: ContentEntity[];
  removed: Array<{ id: string; path: string }>;
}

// --- Validation ---

export interface ValidationError {
  entityId: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
