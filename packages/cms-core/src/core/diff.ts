import type { ContentEntity, Manifest, ChangeSet } from "../types";

export const computeChangeSet = (
  entities: ContentEntity[],
  manifest: Manifest
): ChangeSet => {
  const added: ContentEntity[] = [];
  const updated: ContentEntity[] = [];

  for (const entity of entities) {
    const prevHash = manifest[entity.id];

    if (!prevHash) {
      added.push(entity);
    } else if (prevHash !== entity.hash) {
      updated.push(entity);
    }
  }

  const removed: Array<{ id: string; path: string }> = [];

  return { added, updated, removed };
};

/**
 * Compute removed entries by comparing manifest ids against current entity ids.
 * Requires an id->path mapping from the previous scan.
 */
export const findRemoved = (
  entities: ContentEntity[],
  manifest: Manifest,
  idToPath: Record<string, string>
): Array<{ id: string; path: string }> => {
  const currentIds = new Set(entities.map((e) => e.id));
  const removed: Array<{ id: string; path: string }> = [];

  for (const id of Object.keys(manifest)) {
    if (!currentIds.has(id)) {
      removed.push({ id, path: idToPath[id] ?? "" });
    }
  }

  return removed;
};
