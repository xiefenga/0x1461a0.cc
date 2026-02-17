import type {
  ContentEntity,
  ValidationError,
  ValidationResult,
} from "../types";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const validateEntities = (entities: ContentEntity[]): ValidationResult => {
  const errors: ValidationError[] = [];
  const seenIds = new Map<string, string>(); // id -> path
  const seenSlugs = new Map<string, string>(); // slug -> path

  for (const entity of entities) {
    // Required: title
    if (!entity.metadata.title) {
      errors.push({
        entityId: entity.id,
        field: "title",
        message: "Title is required",
      });
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

    // Valid dates
    if (entity.metadata.created && isNaN(Date.parse(entity.metadata.created))) {
      errors.push({
        entityId: entity.id,
        field: "created",
        message: `Invalid date "${entity.metadata.created}"`,
      });
    }
    if (entity.metadata.updated && isNaN(Date.parse(entity.metadata.updated))) {
      errors.push({
        entityId: entity.id,
        field: "updated",
        message: `Invalid date "${entity.metadata.updated}"`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
};
