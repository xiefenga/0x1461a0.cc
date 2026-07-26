import { describe, it, expect } from "vitest";
import { validateEntities } from "../validator";
import type { ContentEntity, MetadataEntry } from "../../types";

const makeMetadata = (
  overrides: Partial<MetadataEntry> = {}
): MetadataEntry => {
  return {
    title: "Test",
    slug: "test",
    tags: [],
    description: "",
    created: "2025-01-01T00:00:00Z",
    updated: "2025-01-01T00:00:00Z",
    ...overrides,
  };
};

function makeEntity(overrides: Partial<ContentEntity> = {}): ContentEntity {
  return {
    id: "test",
    slug: "test",
    path: "test.md",
    body: "body",
    metadata: makeMetadata(),
    hash: "abc",
    ...overrides,
  };
}

describe("validateEntities", () => {
  it("passes for valid entities", () => {
    const result = validateEntities([
      makeEntity({ id: "a", slug: "a" }),
      makeEntity({ id: "b", slug: "b" }),
    ]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("detects duplicate ids", () => {
    const result = validateEntities([
      makeEntity({ id: "dup", slug: "slug-a", path: "a.md" }),
      makeEntity({ id: "dup", slug: "slug-b", path: "b.md" }),
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "id")).toBe(true);
  });

  it("detects duplicate slugs", () => {
    const result = validateEntities([
      makeEntity({ id: "a", slug: "same", path: "a.md" }),
      makeEntity({ id: "b", slug: "same", path: "b.md" }),
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "slug")).toBe(true);
  });

  it("detects invalid slug format", () => {
    const result = validateEntities([
      makeEntity({ slug: "Invalid Slug With Spaces" }),
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "slug")).toBe(true);
  });

  it("detects invalid dates", () => {
    const result = validateEntities([
      makeEntity({
        metadata: makeMetadata({ created: "not-a-date" }),
      }),
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "created")).toBe(true);
  });

  it("passes with valid dates", () => {
    const result = validateEntities([
      makeEntity({
        metadata: makeMetadata({
          created: "2025-01-01T00:00:00Z",
          updated: "2025-01-02T00:00:00Z",
        }),
      }),
    ]);
    expect(result.valid).toBe(true);
  });

  it("rejects frontmatter in source Markdown", () => {
    const result = validateEntities([
      makeEntity({ body: "---\ntitle: Inline\n---\n\n# Body" }),
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: "body" })
    );
  });

  it("allows source frontmatter when transitional mode is enabled", () => {
    const result = validateEntities(
      [makeEntity({ body: "---\ntitle: Inline\n---\n\n# Body" })],
      { allowSourceFrontmatter: true }
    );

    expect(result.valid).toBe(true);
  });
});
