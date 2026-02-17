import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { scanContentDir, buildEntities } from "../scanner";

describe("scanner", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "0xmd-scan-test-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe("scanContentDir", () => {
    it("finds markdown files", async () => {
      await writeFile(join(tmpDir, "post1.md"), "content1");
      await writeFile(join(tmpDir, "post2.md"), "content2");

      const files = await scanContentDir(tmpDir, ["**/*.md"]);
      expect(files).toHaveLength(2);
      expect(files.sort()).toEqual(["post1.md", "post2.md"]);
    });

    it("finds files in subdirectories", async () => {
      await mkdir(join(tmpDir, "sub"), { recursive: true });
      await writeFile(join(tmpDir, "sub", "nested.md"), "content");

      const files = await scanContentDir(tmpDir, ["**/*.md"]);
      expect(files).toContain("sub/nested.md");
    });

    it("ignores .0xmd directory", async () => {
      await mkdir(join(tmpDir, ".0xmd"), { recursive: true });
      await writeFile(join(tmpDir, ".0xmd", "internal.md"), "data");
      await writeFile(join(tmpDir, "post.md"), "content");

      const files = await scanContentDir(tmpDir, ["**/*.md"]);
      expect(files).toEqual(["post.md"]);
    });

    it("returns empty array when no files match", async () => {
      const files = await scanContentDir(tmpDir, ["**/*.md"]);
      expect(files).toEqual([]);
    });
  });

  describe("buildEntities", () => {
    it("builds entities from files and metadata", async () => {
      await writeFile(join(tmpDir, "hello.md"), "# Hello");

      const entities = await buildEntities(
        tmpDir,
        ["hello.md"],
        { "hello.md": { title: "Hello World" } }
      );

      expect(entities).toHaveLength(1);
      expect(entities[0].id).toBe("hello"); // id from path
      expect(entities[0].slug).toBe("hello-world"); // slug from title
      expect(entities[0].body).toBe("# Hello");
      expect(entities[0].hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("uses filepath for id regardless of metadata", async () => {
      await writeFile(join(tmpDir, "my-post.md"), "body");

      const entities = await buildEntities(tmpDir, ["my-post.md"], {});
      expect(entities[0].id).toBe("my-post"); // id from path
    });
  });
});
