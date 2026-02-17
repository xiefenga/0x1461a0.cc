import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ContentManager } from "../content-manager";
import type { Config } from "../../config/schema";

describe("ContentManager", () => {
  let tmpDir: string;
  let config: Config;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "0xmd-cm-test-"));
    config = {
      contentDir: tmpDir,
      git: { remote: "git@github.com:test/repo.git", branch: "main" },
      patterns: ["**/*.md"],
    };
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("initializes and creates data dir", async () => {
    const cm = new ContentManager(config);
    await cm.init();
    // Should not throw
  });

  it("scans and finds markdown files", async () => {
    await writeFile(join(tmpDir, "post1.md"), "# Post 1");
    await writeFile(join(tmpDir, "post2.md"), "# Post 2");

    const cm = new ContentManager(config);
    await cm.init();
    const entities = await cm.scan();

    expect(entities).toHaveLength(2);
  });

  it("computes changeset (all added on first scan)", async () => {
    await writeFile(join(tmpDir, "post.md"), "# Post");

    const cm = new ContentManager(config);
    await cm.init();
    await cm.scan();

    const cs = await cm.getChangeSet();
    expect(cs.added).toHaveLength(1);
    expect(cs.updated).toHaveLength(0);
    expect(cs.removed).toHaveLength(0);
  });

  it("detects no changes after manifest update", async () => {
    await writeFile(join(tmpDir, "post.md"), "# Post");

    const cm = new ContentManager(config);
    await cm.init();
    await cm.scan();
    await cm.updateManifest();

    // Re-scan
    await cm.scan();
    const cs = await cm.getChangeSet();
    expect(cs.added).toHaveLength(0);
    expect(cs.updated).toHaveLength(0);
  });

  it("validates entities", async () => {
    await writeFile(join(tmpDir, "post.md"), "# Post");

    const cm = new ContentManager(config);
    await cm.init();
    await cm.scan();

    const result = cm.validate();
    expect(result.valid).toBe(true);
  });

  it("builds index", async () => {
    await writeFile(join(tmpDir, "post.md"), "# Post");

    const cm = new ContentManager(config);
    await cm.init();
    await cm.scan();
    const index = await cm.rebuildIndex();

    expect(Object.keys(index.byId)).toHaveLength(1);
    expect(index.sortedByDate).toHaveLength(1);
  });

  it("resets manifest", async () => {
    await writeFile(join(tmpDir, "post.md"), "# Post");

    const cm = new ContentManager(config);
    await cm.init();
    await cm.scan();
    await cm.updateManifest();
    await cm.resetManifest();

    // After reset, everything should appear as added
    await cm.scan();
    const cs = await cm.getChangeSet();
    expect(cs.added).toHaveLength(1);
  });
});
