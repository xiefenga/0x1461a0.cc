import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, unlink, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ContentManager } from "../core/content-manager";
import type { Config } from "../config/schema";

describe("e2e workflow", () => {
  let tmpDir: string;
  let config: Config;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "0xmd-e2e-"));
    config = {
      contentDir: tmpDir,
      git: { remote: "git@github.com:test/repo.git", branch: "main" },
      patterns: ["**/*.md"],
    };
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("full lifecycle: scan -> changeset -> manifest -> modify -> rescan -> delete -> rescan", async () => {
    // 1. Create initial content
    await writeFile(join(tmpDir, "post-a.md"), "# Post A\n\nContent of A");
    await writeFile(join(tmpDir, "post-b.md"), "# Post B\n\nContent of B");

    const cm = new ContentManager(config);
    await cm.init();

    // 2. First scan — all files are new
    const entities1 = await cm.scan();
    expect(entities1).toHaveLength(2);

    // 3. Changeset — all should be added
    const cs1 = await cm.getChangeSet();
    expect(cs1.added).toHaveLength(2);
    expect(cs1.updated).toHaveLength(0);
    expect(cs1.removed).toHaveLength(0);

    // 4. Validate
    const validation1 = cm.validate();
    expect(validation1.valid).toBe(true);

    // 5. Update manifest
    await cm.updateManifest();

    // 6. Rescan — no changes
    await cm.scan();
    const cs2 = await cm.getChangeSet();
    expect(cs2.added).toHaveLength(0);
    expect(cs2.updated).toHaveLength(0);
    expect(cs2.removed).toHaveLength(0);

    // 7. Modify a file
    await writeFile(join(tmpDir, "post-a.md"), "# Post A\n\nUpdated content!");

    // 8. Rescan — should detect update
    await cm.scan();
    const cs3 = await cm.getChangeSet();
    expect(cs3.added).toHaveLength(0);
    expect(cs3.updated).toHaveLength(1);
    expect(cs3.updated[0].path).toBe("post-a.md");
    expect(cs3.removed).toHaveLength(0);

    // 9. Update manifest again
    await cm.updateManifest();

    // 10. Delete a file
    await unlink(join(tmpDir, "post-b.md"));

    // 11. Rescan — should detect removal
    await cm.scan();
    const cs4 = await cm.getChangeSet();
    expect(cs4.added).toHaveLength(0);
    expect(cs4.updated).toHaveLength(0);
    expect(cs4.removed).toHaveLength(1);
    expect(cs4.removed[0].id).toContain("post");

    // 12. Build index
    const index = await cm.rebuildIndex();
    expect(Object.keys(index.byId)).toHaveLength(1); // Only post-a remains
    expect(index.sortedByDate).toHaveLength(1);

    // 13. Verify data files exist
    expect(existsSync(join(tmpDir, ".0xmd", "metadata.json"))).toBe(true);
    expect(existsSync(join(tmpDir, ".0xmd", "manifest.json"))).toBe(true);
    expect(existsSync(join(tmpDir, ".0xmd", "index.json"))).toBe(true);

    // 14. Reset manifest — everything becomes "added" again
    await cm.resetManifest();
    await cm.scan();
    const cs5 = await cm.getChangeSet();
    expect(cs5.added).toHaveLength(1); // Only post-a
    expect(cs5.updated).toHaveLength(0);
    expect(cs5.removed).toHaveLength(0);
  });

  it("handles subdirectory content", async () => {
    const { mkdir } = await import("node:fs/promises");
    await mkdir(join(tmpDir, "blog"), { recursive: true });
    await writeFile(join(tmpDir, "blog", "nested.md"), "# Nested");

    const cm = new ContentManager(config);
    await cm.init();
    const entities = await cm.scan();

    expect(entities).toHaveLength(1);
    expect(entities[0].path).toBe("blog/nested.md");
  });

  it("handles empty content directory", async () => {
    const cm = new ContentManager(config);
    await cm.init();
    const entities = await cm.scan();

    expect(entities).toHaveLength(0);

    const cs = await cm.getChangeSet();
    expect(cs.added).toHaveLength(0);
    expect(cs.updated).toHaveLength(0);
    expect(cs.removed).toHaveLength(0);
  });
});
