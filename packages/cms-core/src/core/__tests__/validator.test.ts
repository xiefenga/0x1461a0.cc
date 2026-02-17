import { describe, it, expect } from "vitest";
import { validateEntities } from "../validator";
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
        metadata: { title: "Test", created: "not-a-date" },
      }),
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "created")).toBe(true);
  });

  it("passes with valid dates", () => {
    const result = validateEntities([
      makeEntity({
        metadata: {
          title: "Test",
          created: "2025-01-01T00:00:00Z",
          updated: "2025-01-02T00:00:00Z",
        },
      }),
    ]);
    expect(result.valid).toBe(true);
  });
});
