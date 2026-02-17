import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { ChangeSet, ContentEntity } from "../../types";
import type { Config } from "../../config/schema";

// Mock simple-git
const mockGit = {
  clone: vi.fn(),
  checkout: vi.fn(),
  pull: vi.fn(),
  add: vi.fn(),
  commit: vi.fn(),
  push: vi.fn(),
  log: vi.fn().mockResolvedValue({ latest: { hash: "abc123" } }),
};

vi.mock("simple-git", () => ({
  simpleGit: vi.fn((dir?: string) => {
    if (!dir) {
      // Bare git for cloning
      return { clone: mockGit.clone };
    }
    return mockGit;
  }),
}));

// Import after mock
const { GitAdapter } = await import("../git-adapter");

describe("GitAdapter", () => {
  let tmpDir: string;
  let cloneDir: string;
  let config: Config;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "0xmd-git-test-"));
    cloneDir = join(tmpDir, "repo");
    config = {
      contentDir: tmpDir,
      git: {
        remote: "git@github.com:test/repo.git",
        branch: "main",
        cloneDir,
      },
      patterns: ["**/*.md"],
    };
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("clones repo when clone dir does not exist", async () => {
    const adapter = new GitAdapter(config);
    const changeSet: ChangeSet = {
      added: [makeEntity({ id: "post", path: "post.md", body: "# Hello" })],
      updated: [],
      removed: [],
    };

    await adapter.publish(changeSet, changeSet.added);

    expect(mockGit.clone).toHaveBeenCalledWith(
      "git@github.com:test/repo.git",
      cloneDir,
      ["--branch", "main", "--single-branch"]
    );
  });

  it("pulls when repo already exists", async () => {
    // Create fake .git dir to simulate existing repo
    await mkdir(join(cloneDir, ".git"), { recursive: true });

    const adapter = new GitAdapter(config);
    const changeSet: ChangeSet = {
      added: [makeEntity({ id: "post", path: "post.md", body: "# Hello" })],
      updated: [],
      removed: [],
    };

    await adapter.publish(changeSet, changeSet.added);

    expect(mockGit.checkout).toHaveBeenCalledWith("main");
    expect(mockGit.pull).toHaveBeenCalledWith("origin", "main");
  });

  it("writes files with frontmatter for added entities", async () => {
    // Simulate clone by creating the dir
    await mkdir(cloneDir, { recursive: true });
    await mkdir(join(cloneDir, ".git"), { recursive: true });

    const adapter = new GitAdapter(config);
    const entity = makeEntity({
      id: "post",
      path: "post.md",
      body: "# Hello",
      metadata: { title: "Hello" },
    });
    const changeSet: ChangeSet = {
      added: [entity],
      updated: [],
      removed: [],
    };

    const result = await adapter.publish(changeSet, [entity]);

    expect(result.success).toBe(true);
    expect(result.published).toBe(1);

    const written = await readFile(join(cloneDir, "post.md"), "utf-8");
    expect(written).toContain("---");
    expect(written).toContain("title: Hello");
    expect(written).toContain("# Hello");
  });

  it("removes files for removed entries", async () => {
    await mkdir(cloneDir, { recursive: true });
    await mkdir(join(cloneDir, ".git"), { recursive: true });
    // Create a file to be removed
    await writeFile(join(cloneDir, "old.md"), "old content");

    const adapter = new GitAdapter(config);
    const changeSet: ChangeSet = {
      added: [],
      updated: [],
      removed: [{ id: "old", path: "old.md" }],
    };

    const result = await adapter.publish(changeSet, []);

    expect(result.removed).toBe(1);
    expect(existsSync(join(cloneDir, "old.md"))).toBe(false);
  });

  it("commits and pushes changes", async () => {
    await mkdir(cloneDir, { recursive: true });
    await mkdir(join(cloneDir, ".git"), { recursive: true });

    const adapter = new GitAdapter(config);
    const entity = makeEntity({ id: "p", path: "p.md", body: "body" });
    const changeSet: ChangeSet = {
      added: [entity],
      updated: [],
      removed: [],
    };

    await adapter.publish(changeSet, [entity]);

    expect(mockGit.add).toHaveBeenCalledWith(".");
    expect(mockGit.commit).toHaveBeenCalledWith("content: add 1 post(s)");
    expect(mockGit.push).toHaveBeenCalledWith("origin", "main");
  });

  it("returns no-op when changeset is empty", async () => {
    await mkdir(cloneDir, { recursive: true });
    await mkdir(join(cloneDir, ".git"), { recursive: true });

    const adapter = new GitAdapter(config);
    const changeSet: ChangeSet = { added: [], updated: [], removed: [] };

    const result = await adapter.publish(changeSet, []);

    expect(result.success).toBe(true);
    expect(result.published).toBe(0);
    expect(result.removed).toBe(0);
    expect(mockGit.commit).not.toHaveBeenCalled();
  });
});

function makeEntity(
  overrides: Partial<ContentEntity> = {}
): ContentEntity {
  return {
    id: "test",
    slug: "test",
    path: "test.md",
    body: "body",
    metadata: { title: "Test" },
    hash: "abc",
    ...overrides,
  };
}
