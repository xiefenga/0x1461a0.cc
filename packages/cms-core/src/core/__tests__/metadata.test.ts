import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";
import { loadMetadata, saveMetadata, syncMetadata } from "../metadata";

describe("metadata", () => {
  let tmpDir: string;
  let dataDir: string;
  let contentDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "0xmd-meta-test-"));
    dataDir = join(tmpDir, ".0xmd");
    contentDir = tmpDir;
    await mkdir(dataDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe("loadMetadata", () => {
    it("returns empty store when file does not exist", async () => {
      const store = await loadMetadata(dataDir);
      expect(store).toEqual({});
    });

    it("loads existing metadata", async () => {
      await saveMetadata(dataDir, {
        "post.md": { title: "Hello" },
      });
      const store = await loadMetadata(dataDir);
      expect(store["post.md"]?.title).toBe("Hello");
    });
  });

  describe("syncMetadata", () => {
    it("adds entries for new files", async () => {
      await writeFile(join(contentDir, "new-post.md"), "content");
      const store = await syncMetadata(
        dataDir,
        contentDir,
        ["new-post.md"],
        {}
      );
      expect(store["new-post.md"]).toBeDefined();
      expect(store["new-post.md"].title).toBe("new post");
    });

    it("removes entries for deleted files", async () => {
      const store = await syncMetadata(
        dataDir,
        contentDir,
        [],
        { "deleted.md": { title: "Old" } }
      );
      expect(store["deleted.md"]).toBeUndefined();
    });

    it("preserves existing entries", async () => {
      await writeFile(join(contentDir, "existing.md"), "content");
      const store = await syncMetadata(
        dataDir,
        contentDir,
        ["existing.md"],
        { "existing.md": { title: "Custom Title", tags: ["blog"] } }
      );
      expect(store["existing.md"].title).toBe("Custom Title");
      expect(store["existing.md"].tags).toEqual(["blog"]);
    });

    it("saves metadata to disk", async () => {
      await writeFile(join(contentDir, "post.md"), "content");
      await syncMetadata(dataDir, contentDir, ["post.md"], {});
      expect(existsSync(join(dataDir, "metadata.json"))).toBe(true);
    });
  });
});
