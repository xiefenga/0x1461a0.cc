import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadConfig, getDataDir } from "../loader";

describe("loadConfig", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "0xmd-test-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("loads a valid config file", async () => {
    const configPath = join(tmpDir, "config.yml");
    await writeFile(
      configPath,
      `contentDir: /tmp/content
git:
  remote: git@github.com:user/repo.git
  branch: main
patterns:
  - "**/*.md"
  - "**/*.mdx"
`
    );

    const config = await loadConfig(configPath);
    expect(config.contentDir).toBe("/tmp/content");
    expect(config.git.remote).toBe("git@github.com:user/repo.git");
    expect(config.git.branch).toBe("main");
    expect(config.patterns).toEqual(["**/*.md", "**/*.mdx"]);
  });

  it("applies defaults for optional fields", async () => {
    const configPath = join(tmpDir, "config.yml");
    await writeFile(
      configPath,
      `contentDir: /tmp/content
git:
  remote: git@github.com:user/repo.git
`
    );

    const config = await loadConfig(configPath);
    expect(config.git.branch).toBe("main");
    expect(config.patterns).toEqual(["**/*.md"]);
    expect(config.frontmatter).toBeUndefined();
  });

  it("loads the transitional source frontmatter policy", async () => {
    const configPath = join(tmpDir, "config.yml");
    await writeFile(
      configPath,
      `contentDir: /tmp/content
git:
  remote: git@github.com:user/repo.git
frontmatter:
  policy: preserve
`
    );

    const config = await loadConfig(configPath);
    expect(config.frontmatter?.policy).toBe("preserve");
  });

  it("throws if config file does not exist", async () => {
    await expect(loadConfig(join(tmpDir, "nope.yml"))).rejects.toThrow(
      "Config file not found"
    );
  });

  it("throws if config is invalid", async () => {
    const configPath = join(tmpDir, "bad.yml");
    await writeFile(configPath, `foo: bar`);
    await expect(loadConfig(configPath)).rejects.toThrow();
  });

  it("resolves ~ in contentDir", async () => {
    const configPath = join(tmpDir, "config.yml");
    await writeFile(
      configPath,
      `contentDir: ~/my-content
git:
  remote: git@github.com:user/repo.git
`
    );

    const config = await loadConfig(configPath);
    expect(config.contentDir).not.toContain("~");
    expect(config.contentDir).toContain("my-content");
  });
});

describe("getDataDir", () => {
  it("returns .0xmd inside content dir", () => {
    expect(getDataDir("/tmp/content")).toBe("/tmp/content/.0xmd");
  });
});
