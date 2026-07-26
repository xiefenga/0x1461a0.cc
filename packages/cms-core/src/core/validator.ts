import type {
  ContentEntity,
  ValidationError,
  ValidationResult,
} from "../types";
import { MetadataEntrySchema } from "../schemas";
import { hasFrontmatter } from "../utils/markdown";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ValidationOptions {
  allowSourceFrontmatter?: boolean;
}

export const validateEntities = (
  entities: ContentEntity[],
  options: ValidationOptions = {}
): ValidationResult => {
  const errors: ValidationError[] = [];
  const seenIds = new Map<string, string>(); // id -> path
  const seenSlugs = new Map<string, string>(); // slug -> path

  for (const entity of entities) {
    const metadataResult = MetadataEntrySchema.safeParse(entity.metadata);
    if (!metadataResult.success) {
      for (const issue of metadataResult.error.issues) {
        errors.push({
          entityId: entity.id,
          field: issue.path.join(".") || "metadata",
          message: issue.message,
        });
      }
    }

    // Duplicate id
    if (seenIds.has(entity.id)) {
      errors.push({
        entityId: entity.id,
        field: "id",
        message: `Duplicate id "${entity.id}" (also at ${seenIds.get(entity.id)})`,
      });
    }
    seenIds.set(entity.id, entity.path);

    // Duplicate slug
    if (seenSlugs.has(entity.slug)) {
      errors.push({
        entityId: entity.id,
        field: "slug",
        message: `Duplicate slug "${entity.slug}" (also at ${seenSlugs.get(entity.slug)})`,
      });
    }
    seenSlugs.set(entity.slug, entity.path);

    // Valid slug format
    if (entity.slug && !SLUG_REGEX.test(entity.slug)) {
      errors.push({
        entityId: entity.id,
        field: "slug",
        message: `Invalid slug format "${entity.slug}"`,
      });
    }

    if (!options.allowSourceFrontmatter && hasFrontmatter(entity.body)) {
      errors.push({
        entityId: entity.id,
        field: "body",
        message:
          "Frontmatter is managed by 0xmd metadata and must not be present in source Markdown",
      });
    }
  }

  return { valid: errors.length === 0, errors };
};
