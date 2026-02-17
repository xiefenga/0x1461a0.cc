import { describe, it, expect } from "vitest";
import { injectFrontmatter } from "../markdown";

describe("injectFrontmatter", () => {
  it("wraps metadata in YAML frontmatter", () => {
    const result = injectFrontmatter("Hello world", {
      title: "My Post",
      tags: ["blog"],
    });
    expect(result).toContain("---");
    expect(result).toContain("title: My Post");
    expect(result).toContain("Hello world");
  });

  it("places frontmatter before body", () => {
    const result = injectFrontmatter("Body text", { title: "Title" });
    const fmEnd = result.lastIndexOf("---");
    const bodyStart = result.indexOf("Body text");
    expect(fmEnd).toBeLessThan(bodyStart);
  });

  it("handles metadata with all fields", () => {
    const result = injectFrontmatter("content", {
      title: "Full",
      slug: "full-post",
      tags: ["a", "b"],
      description: "desc",
      created: "2025-01-01T00:00:00Z",
      updated: "2025-01-02T00:00:00Z",
    });
    expect(result).toContain("slug: full-post");
    expect(result).toContain("description: desc");
  });
});
