import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
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
const astroPackagePath = createRequire(import.meta.url).resolve("astro/package.json");
const astroPackage = JSON.parse(readFileSync(astroPackagePath, "utf-8"));
const ASTRO_CLI = join(dirname(astroPackagePath), astroPackage.bin.astro);

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

## Reading section

### Nested section

[你真的会用<a>标签吗？](https://example.org)

\`\`\`typescript
const answer = 42;
\`\`\`

| Name | Value |
| --- | --- |
| token | paper |
`
      );

      await writeFile(
        join(contentDir, "component.mdx"),
        `---
title: MDX Contract
slug: mdx-route
created: 2026-07-26T08:00:00.000Z
updated: 2026-07-26T09:00:00.000Z
---

export const Highlight = ({ children }) => <mark>{children}</mark>;

<Highlight>MDX still renders</Highlight>

\`\`\`js
const mdx = true;
\`\`\`
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

      expect(html).toContain('aria-label="本文目录"');
      expect(html).toContain('href="#reading-section"');
      expect(html).toContain('href="#nested-section"');
      expect(html).toContain("code-block-wrapper");
      expect(html).toContain('aria-label="复制代码"');
      expect(html).toContain("--shiki-dark");
      expect(html).toMatch(/你真的会用(?:&lt;|&#x3C;)a(?:&gt;|>)标签吗？/);
      expect(html).toContain("<table>");
      expect(html).not.toContain("text-gray-");
      const assets = await readdir(join(outputDir, "_astro"));
      const styles = (await Promise.all(assets.filter((file) => file.endsWith(".css"))
        .map((file) => readFile(join(outputDir, "_astro", file), "utf-8")))).join("\n");
      expect(styles).toContain("--colors-paper:");
      expect(styles).toContain("var(--colors-paper)");
      expect(styles).not.toContain("token(");
      const mdx = await readFile(join(outputDir, "post", "mdx-route", "index.html"), "utf-8");
      expect(mdx).toContain("<mark>MDX still renders</mark>");
      expect(mdx).toContain("code-block-wrapper");
      expect(mdx).not.toContain('aria-label="本文目录"');

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
