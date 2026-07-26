import { join, resolve, sep } from "node:path";
import { existsSync } from "node:fs";
import { writeFile, rm, mkdir } from "node:fs/promises";
import { simpleGit, type SimpleGit } from "simple-git";
import type { ChangeSet, ContentEntity } from "../types";
import type { Config } from "../config/schema";
import { hasFrontmatter, injectFrontmatter } from "../utils/markdown";
import type { StorageAdapter, PublishResult } from "./storage-adapter";

export class GitAdapter implements StorageAdapter {
  private config: Config;
  private cloneDir: string;

  constructor(config: Config) {
    this.config = config;
    this.cloneDir =
      config.git.cloneDir ?? join(config.contentDir, ".0xmd", "repo");
  }

  private async ensureRepo(): Promise<SimpleGit> {
    if (!existsSync(join(this.cloneDir, ".git"))) {
      await mkdir(this.cloneDir, { recursive: true });
      const git = simpleGit();
      await git.clone(this.config.git.remote, this.cloneDir, [
        "--branch",
        this.config.git.branch,
        "--single-branch",
      ]);
      return simpleGit(this.cloneDir);
    }

    const git = simpleGit(this.cloneDir);
    await git.checkout(this.config.git.branch);
    await git.pull("origin", this.config.git.branch);
    return git;
  }

  async publish(
    changeSet: ChangeSet,
    _allEntities: ContentEntity[]
  ): Promise<PublishResult> {
    const git = await this.ensureRepo();

    let published = 0;

    // Write added and updated files
    const toWrite = [...changeSet.added, ...changeSet.updated];
    for (const entity of toWrite) {
      const preserveSourceFrontmatter =
        this.config.frontmatter?.policy === "preserve" &&
        hasFrontmatter(entity.body);
      const content = preserveSourceFrontmatter
        ? entity.body
        : injectFrontmatter(entity.body, entity.metadata);
      const targetPath = this.resolveContentPath(entity.path);

      // Ensure parent directory exists
      const dir = join(targetPath, "..");
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      await writeFile(targetPath, content, "utf-8");
      published++;
    }

    // Remove deleted files
    let removed = 0;
    for (const entry of changeSet.removed) {
      const targetPath = this.resolveContentPath(entry.path);
      if (existsSync(targetPath)) {
        await rm(targetPath);
        removed++;
      }
    }

    if (published === 0 && removed === 0) {
      return { success: true, published: 0, removed: 0, message: "No changes to publish" };
    }

    // Git add, commit, push
    await git.add(".");

    const message = this.generateCommitMessage(changeSet);
    await git.commit(message);
    await git.push("origin", this.config.git.branch);

    const log = await git.log({ maxCount: 1 });
    const commitHash = log.latest?.hash;

    return { success: true, published, removed, commitHash, message };
  }

  private generateCommitMessage(changeSet: ChangeSet): string {
    const parts: string[] = [];

    if (changeSet.added.length > 0) {
      parts.push(`add ${changeSet.added.length} post(s)`);
    }
    if (changeSet.updated.length > 0) {
      parts.push(`update ${changeSet.updated.length} post(s)`);
    }
    if (changeSet.removed.length > 0) {
      parts.push(`remove ${changeSet.removed.length} post(s)`);
    }

    return `content: ${parts.join(", ")}`;
  }

  private resolveContentPath(relativePath: string): string {
    if (!relativePath) {
      throw new Error("Refusing to publish an empty content path");
    }

    const root = resolve(this.cloneDir);
    const target = resolve(root, relativePath);
    if (target === root || !target.startsWith(`${root}${sep}`)) {
      throw new Error(
        `Refusing to publish a path outside the content repository: ${relativePath}`
      );
    }
    return target;
  }
}
