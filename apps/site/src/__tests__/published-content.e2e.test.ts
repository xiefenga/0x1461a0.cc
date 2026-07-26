import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const SITE_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);
const ASTRO_CLI = join(SITE_DIR, "node_modules", "astro", "astro.js");

describe("published 0xmd content contract", () => {
  let rootDir: string | undefined;

  afterEach(async () => {
    if (rootDir) {
      await rm(rootDir, { recursive: true, force: true });
    }
  });

  it(
    "renders a post at its metadata slug from a full 0xmd frontmatter payload",
    async () => {
      rootDir = await mkdtemp(join(tmpdir(), "0xmd-site-render-"));
      const contentDir = join(rootDir, "content");
      const outputDir = join(rootDir, "dist");
      await mkdir(contentDir);
      await writeFile(
        join(contentDir, "path-derived-id.md"),
        `---
title: CMS Contract Post
slug: metadata-route
tags:
  - cms
  - local-first
description: Rendered from the 0xmd Git publishing contract
created: 2026-07-26T08:00:00.000Z
updated: 2026-07-26T09:00:00.000Z
---

# Published body

This body came from a pure local Markdown source.
`
      );

      await execFileAsync(
        process.execPath,
        [ASTRO_CLI, "build", "--force", "--outDir", outputDir],
        {
          cwd: SITE_DIR,
          env: {
            ...process.env,
            SITE_TITLE: "0xmd Contract Test",
            CONTENT_LOADER_BASE: contentDir,
          },
        }
      );

      const html = await readFile(
        join(outputDir, "post", "metadata-route", "index.html"),
        "utf-8"
      );
      expect(html).toContain("CMS Contract Post");
      expect(html).toContain("Published body");
      expect(html).toContain(
        "Rendered from the 0xmd Git publishing contract"
      );

      const index = await readFile(join(outputDir, "index.html"), "utf-8");
      expect(index).toContain("/post/metadata-route/");

      const feed = await readFile(join(outputDir, "rss.xml"), "utf-8");
      expect(feed).toContain(
        "https://www.0x1461a0.cc/post/metadata-route/"
      );
      expect(feed).not.toContain("https://example.com");
    },
    30_000
  );
});
