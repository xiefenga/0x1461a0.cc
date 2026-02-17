import { describe, it, expect } from "vitest";
import { MetadataEntrySchema } from "../schemas";

describe("MetadataEntrySchema", () => {
  it("parses a valid full entry", () => {
    const result = MetadataEntrySchema.parse({
      title: "Hello World",
      slug: "hello-world",
      tags: ["blog", "intro"],
      description: "My first post",
      created: "2025-01-01T00:00:00Z",
      updated: "2025-01-02T00:00:00Z",
    });
    expect(result.title).toBe("Hello World");
    expect(result.slug).toBe("hello-world");
    expect(result.tags).toEqual(["blog", "intro"]);
  });

  it("parses a minimal valid entry", () => {
    const result = MetadataEntrySchema.parse({
      title: "Minimal",
      slug: "minimal",
      tags: [],
      description: "",
      created: "2025-01-01T00:00:00Z",
      updated: "2025-01-01T00:00:00Z",
    });
    expect(result.title).toBe("Minimal");
    expect(result.tags).toEqual([]);
    expect(result.description).toBe("");
  });

  it("rejects empty title", () => {
    expect(() => MetadataEntrySchema.parse({ title: "" })).toThrow();
  });

  it("rejects missing title", () => {
    expect(() => MetadataEntrySchema.parse({})).toThrow();
  });

  it("rejects invalid datetime format", () => {
    expect(() =>
      MetadataEntrySchema.parse({ title: "Test", created: "not-a-date" })
    ).toThrow();
  });
});
