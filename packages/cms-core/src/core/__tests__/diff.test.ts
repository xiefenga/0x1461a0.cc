import { describe, it, expect } from "vitest";
import { computeChangeSet, findRemoved } from "../diff";
import type { ContentEntity, Manifest } from "../../types";

function makeEntity(overrides: Partial<ContentEntity> = {}): ContentEntity {
  return {
    id: "test",
    slug: "test",
    path: "test.md",
    body: "body",
    metadata: { title: "Test" },
    hash: "abc123",
    ...overrides,
  };
}

describe("computeChangeSet", () => {
  it("detects added entities", () => {
    const entities = [makeEntity({ id: "new", hash: "h1" })];
    const manifest: Manifest = {};

    const cs = computeChangeSet(entities, manifest);
    expect(cs.added).toHaveLength(1);
    expect(cs.added[0].id).toBe("new");
    expect(cs.updated).toHaveLength(0);
  });

  it("detects updated entities", () => {
    const entities = [makeEntity({ id: "existing", hash: "new-hash" })];
    const manifest: Manifest = { existing: "old-hash" };

    const cs = computeChangeSet(entities, manifest);
    expect(cs.updated).toHaveLength(1);
    expect(cs.added).toHaveLength(0);
  });

  it("ignores unchanged entities", () => {
    const entities = [makeEntity({ id: "same", hash: "same-hash" })];
    const manifest: Manifest = { same: "same-hash" };

    const cs = computeChangeSet(entities, manifest);
    expect(cs.added).toHaveLength(0);
    expect(cs.updated).toHaveLength(0);
  });
});

describe("findRemoved", () => {
  it("detects removed entities", () => {
    const entities: ContentEntity[] = [];
    const manifest: Manifest = { old: "hash" };
    const pathMap = { old: "old.md" };

    const removed = findRemoved(entities, manifest, pathMap);
    expect(removed).toHaveLength(1);
    expect(removed[0]).toEqual({ id: "old", path: "old.md" });
  });

  it("returns empty when nothing removed", () => {
    const entities = [makeEntity({ id: "a" })];
    const manifest: Manifest = { a: "hash" };

    const removed = findRemoved(entities, manifest, {});
    expect(removed).toHaveLength(0);
  });
});
