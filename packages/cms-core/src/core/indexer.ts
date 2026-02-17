import type { ContentEntity, ContentIndex } from "../types";

export const buildIndex = (entities: ContentEntity[]): ContentIndex => {
  const byId: Record<string, ContentEntity> = {};
  const bySlug: Record<string, ContentEntity> = {};
  const byTag: Record<string, ContentEntity[]> = {};

  for (const entity of entities) {
    byId[entity.id] = entity;
    bySlug[entity.slug] = entity;

    if (entity.metadata.tags) {
      for (const tag of entity.metadata.tags) {
        if (!byTag[tag]) {
          byTag[tag] = [];
        }
        byTag[tag].push(entity);
      }
    }
  }

  const sortedByDate = [...entities].sort((a, b) => {
    const dateA = a.metadata.created ?? "";
    const dateB = b.metadata.created ?? "";
    return dateB.localeCompare(dateA); // newest first
  });

  return { byId, bySlug, byTag, sortedByDate };
};
