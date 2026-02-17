import { describe, it, expect } from "vitest";
import { generateSlug, generateId } from "../id";

describe("generateId", () => {
  it("generates id from file path", () => {
    expect(generateId("hello-world.md")).toBe("hello-world");
  });

  it("handles subdirectory paths", () => {
    expect(generateId("posts/my-post.md")).toBe("posts-my-post");
  });

  it("transliterates Chinese characters to pinyin", () => {
    expect(generateId("你好世界.md")).toBe("ni-hao-shi-jie");
  });

  it("handles mixed Chinese and English", () => {
    expect(generateId("posts/我的blog.md")).toBe("posts-wo-de-blog");
  });

  it("strips .mdx extension too", () => {
    expect(generateId("post.mdx")).toBe("post");
  });
});

describe("generateSlug", () => {
  it("uses slug from metadata if present", () => {
    expect(generateSlug({ title: "My Title", slug: "custom-slug" }, "file.md"))
      .toBe("custom-slug");
  });

  it("slugifies title when no slug is set", () => {
    expect(generateSlug({ title: "Hello World!" }, "file.md"))
      .toBe("hello-world");
  });

  it("transliterates Chinese title to pinyin slug", () => {
    expect(generateSlug({ title: "你好世界" }, "file.md"))
      .toBe("ni-hao-shi-jie");
  });

  it("falls back to path-based id when no title", () => {
    expect(generateSlug({}, "posts/my-post.md"))
      .toBe("posts-my-post");
  });

  it("id and slug are independent", () => {
    const meta = { title: "Hello World" };
    const filePath = "posts/different-name.md";
    expect(generateId(filePath)).toBe("posts-different-name");
    expect(generateSlug(meta, filePath)).toBe("hello-world");
  });
});
