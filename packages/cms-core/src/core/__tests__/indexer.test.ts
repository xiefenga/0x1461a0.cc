import { describe, it, expect } from "vitest";
import { buildIndex } from "../indexer";
import type { ContentEntity } from "../../types";

function makeEntity(overrides: Partial<ContentEntity> = {}): ContentEntity {
  return {
    id: "test",
    slug: "test",
    path: "test.md",
    body: "body",
    metadata: { title: "Test" },
    hash: "abc",
    ...overrides,
  };
}

describe("buildIndex", () => {
  it("indexes by id", () => {
    const entities = [makeEntity({ id: "a" }), makeEntity({ id: "b" })];
    const index = buildIndex(entities);
    expect(index.byId["a"]).toBeDefined();
    expect(index.byId["b"]).toBeDefined();
  });

  it("indexes by slug", () => {
    const entities = [makeEntity({ slug: "my-slug" })];
    const index = buildIndex(entities);
    expect(index.bySlug["my-slug"]).toBeDefined();
  });

  it("indexes by tag", () => {
    const entities = [
      makeEntity({ id: "a", metadata: { title: "A", tags: ["js", "blog"] } }),
      makeEntity({ id: "b", metadata: { title: "B", tags: ["js"] } }),
    ];
    const index = buildIndex(entities);
    expect(index.byTag["js"]).toHaveLength(2);
    expect(index.byTag["blog"]).toHaveLength(1);
  });

  it("sorts by date descending", () => {
    const entities = [
      makeEntity({
        id: "old",
        metadata: { title: "Old", created: "2024-01-01T00:00:00Z" },
      }),
      makeEntity({
        id: "new",
        metadata: { title: "New", created: "2025-06-01T00:00:00Z" },
      }),
    ];
    const index = buildIndex(entities);
    expect(index.sortedByDate[0].id).toBe("new");
    expect(index.sortedByDate[1].id).toBe("old");
  });

  it("handles entities without tags", () => {
    const entities = [makeEntity()];
    const index = buildIndex(entities);
    expect(Object.keys(index.byTag)).toHaveLength(0);
  });
});
