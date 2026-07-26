import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const CLI_PATH = fileURLToPath(
  new URL("../../dist/index.js", import.meta.url)
);

describe("0xmd CLI publish workflow", () => {
  let rootDir: string | undefined;

  afterEach(async () => {
    if (rootDir) {
      await rm(rootDir, { recursive: true, force: true });
    }
  });

  it(
    "keeps local Markdown pure and publishes frontmatter through real git commits",
    async () => {
      rootDir = await mkdtemp(join(tmpdir(), "0xmd-cli-e2e-"));
      const homeDir = join(rootDir, "home");
      const contentDir = join(rootDir, "content");
      const remoteDir = join(rootDir, "content.git");
      const seedDir = join(rootDir, "seed");
      const cloneDir = join(rootDir, "publisher");
      const checkoutDir = join(rootDir, "checkout");
      const postPath = join(contentDir, "post.md");
      const retiredPath = join(contentDir, "retired.md");
      const localBody = "# Draft\n\nWritten in Typora without frontmatter.\n";

      await mkdir(homeDir, { recursive: true });
      await mkdir(contentDir, { recursive: true });
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
      await writeFile(join(seedDir, "README.md"), "# Content repository\n");
      await git(["-C", seedDir, "add", "README.md"]);
      await git(["-C", seedDir, "commit", "-m", "chore: initialize content"]);
      await git(["-C", seedDir, "push", "origin", "main"]);

      const configPath = join(homeDir, ".0xmd", "0xmd.config.yml");
      await mkdir(dirname(configPath), { recursive: true });
      await writeFile(
        configPath,
        JSON.stringify({
          contentDir,
          git: {
            remote: remoteDir,
            branch: "main",
            cloneDir,
          },
          patterns: ["**/*.md"],
        })
      );
      await writeFile(postPath, localBody);
      await writeFile(retiredPath, "# Retired\n\nRemove me after v1.\n");

      const scan = await runCli(homeDir, ["scan"]);
      expect(scan).toContain("Found 2 content file(s)");
      expect(await readFile(postPath, "utf-8")).toBe(localBody);

      const metadata = await runCli(homeDir, [
        "metadata",
        "post.md",
        "--title",
        "Published Title",
        "--slug",
        "published-title",
        "--tags",
        "cms,local-first",
        "--description",
        "Managed outside Markdown",
      ]);
      expect(metadata).toContain("Metadata updated: post.md");

      expect(await runCli(homeDir, ["validate"])).toContain(
        "All content is valid"
      );
      const initialDiff = await runCli(homeDir, ["diff"]);
      expect(initialDiff).toContain("2 added");

      expect(await runCli(homeDir, ["publish", "--dry-run"])).toContain(
        "Dry run"
      );
      expect(existsSync(join(contentDir, ".0xmd", "manifest.json"))).toBe(false);

      expect(await runCli(homeDir, ["publish", "--yes"])).toContain(
        "Published: 2 written, 0 removed"
      );
      expect(await readFile(postPath, "utf-8")).toBe(localBody);

      await git(["clone", remoteDir, checkoutDir]);
      const published = await readFile(join(checkoutDir, "post.md"), "utf-8");
      expect(published).toMatch(/^---\n/);
      expect(published).toContain("title: Published Title");
      expect(published).toContain("slug: published-title");
      expect(published).toContain("- cms");
      expect(published).toContain(localBody);

      await writeFile(
        postPath,
        "# Draft\n\nUpdated locally and still free of frontmatter.\n"
      );
      await unlink(retiredPath);

      const changedDiff = await runCli(homeDir, ["diff"]);
      expect(changedDiff).toContain("1 updated");
      expect(changedDiff).toContain("1 removed");
      expect(changedDiff).toContain("retired.md");

      expect(await runCli(homeDir, ["publish", "-y"])).toContain(
        "Published: 1 written, 1 removed"
      );

      await git(["-C", checkoutDir, "pull", "origin", "main"]);
      expect(existsSync(join(checkoutDir, "retired.md"))).toBe(false);
      expect(await readFile(join(checkoutDir, "post.md"), "utf-8")).toContain(
        "Updated locally and still free of frontmatter."
      );

      const manifest = JSON.parse(
        await readFile(
          join(contentDir, ".0xmd", "manifest.json"),
          "utf-8"
        )
      ) as Record<string, string>;
      expect(Object.keys(manifest)).toEqual(["post"]);

      const subjects = await git([
        "--git-dir",
        remoteDir,
        "log",
        "--format=%s",
        "main",
      ]);
      expect(subjects).toContain("content: add 2 post(s)");
      expect(subjects).toContain(
        "content: update 1 post(s), remove 1 post(s)"
      );
    },
    30_000
  );
});

const runCli = async (homeDir: string, args: string[]): Promise<string> => {
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    [CLI_PATH, ...args],
    {
      env: {
        ...process.env,
        HOME: homeDir,
        NODE_ENV: "production",
        TEST: "false",
        CONSOLA_LEVEL: "4",
        GIT_AUTHOR_NAME: "0xmd Test",
        GIT_AUTHOR_EMAIL: "0xmd@example.invalid",
        GIT_COMMITTER_NAME: "0xmd Test",
        GIT_COMMITTER_EMAIL: "0xmd@example.invalid",
      },
    }
  );
  return `${stdout}${stderr}`;
};

const git = async (args: string[]): Promise<string> => {
  const { stdout, stderr } = await execFileAsync("git", args);
  return `${stdout}${stderr}`;
};
