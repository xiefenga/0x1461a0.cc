import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const { syncContent } = await import("../../scripts/sync-content.mjs");

describe("site content synchronization", () => {
  let rootDir: string | undefined;

  afterEach(async () => {
    if (rootDir) {
      await rm(rootDir, { recursive: true, force: true });
    }
  });

  it("keeps existing local content when no remote is configured", async () => {
    rootDir = await mkdtemp(join(tmpdir(), "0xmd-site-sync-"));
    const contentDir = join(rootDir, "content");
    await mkdir(contentDir);
    await writeFile(join(contentDir, "local.md"), "# Local\n");

    const result = await syncContent({
      siteDir: rootDir,
      remote: "",
    });

    expect(result.synced).toBe(false);
    expect(await readFile(join(contentDir, "local.md"), "utf-8")).toBe(
      "# Local\n"
    );
  });

  it("replaces content only after a remote clone succeeds", async () => {
    rootDir = await mkdtemp(join(tmpdir(), "0xmd-site-sync-"));
    const contentDir = join(rootDir, "content");
    const remoteDir = join(rootDir, "content.git");
    const seedDir = join(rootDir, "seed");
    await mkdir(contentDir);
    await writeFile(join(contentDir, "old.md"), "# Old\n");

    await git(["init", "--bare", "--initial-branch=main", remoteDir]);
    await git(["clone", remoteDir, seedDir]);
    await git(["-C", seedDir, "config", "user.name", "0xmd Test"]);
    await git([
      "-C",
      seedDir,
      "config",
      "user.email",
      "0xmd@example.invalid",
    ]);
    await writeFile(join(seedDir, "published.md"), "# Published\n");
    await git(["-C", seedDir, "add", "published.md"]);
    await git(["-C", seedDir, "commit", "-m", "content: publish"]);
    await git(["-C", seedDir, "push", "origin", "main"]);

    const result = await syncContent({
      siteDir: rootDir,
      remote: remoteDir,
      branch: "main",
    });

    expect(result.synced).toBe(true);
    expect(existsSync(join(contentDir, "old.md"))).toBe(false);
    expect(await readFile(join(contentDir, "published.md"), "utf-8")).toBe(
      "# Published\n"
    );
    expect(existsSync(join(contentDir, ".git"))).toBe(false);
    expect(
      (await readdir(rootDir)).some(
        (name) =>
          name.startsWith(".content-sync-") ||
          name.startsWith("content.backup-")
      )
    ).toBe(false);
  });

  it("preserves existing content when cloning fails", async () => {
    rootDir = await mkdtemp(join(tmpdir(), "0xmd-site-sync-"));
    const contentDir = join(rootDir, "content");
    await mkdir(contentDir);
    await writeFile(join(contentDir, "safe.md"), "# Safe\n");

    await expect(
      syncContent({
        siteDir: rootDir,
        remote: join(rootDir, "missing.git"),
      })
    ).rejects.toThrow();

    expect(await readFile(join(contentDir, "safe.md"), "utf-8")).toBe(
      "# Safe\n"
    );
  });
});

const git = async (args: string[]): Promise<void> => {
  await execFileAsync("git", args);
};
