import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import {
  mkdtemp,
  rename,
  rm,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";

const execFileAsync = promisify(execFile);
const DEFAULT_SITE_DIR = dirname(dirname(fileURLToPath(import.meta.url)));

export const syncContent = async ({
  siteDir = DEFAULT_SITE_DIR,
  remote = process.env.CONTENT_REPO_URL,
  branch = process.env.CONTENT_REPO_BRANCH ?? "main",
} = {}) => {
  const contentDir = join(siteDir, "content");
  const normalizedRemote = remote?.trim();

  if (!normalizedRemote) {
    if (existsSync(contentDir)) {
      console.info(
        "[site] CONTENT_REPO_URL is not set; using the existing content directory."
      );
      return { synced: false, contentDir };
    }
    throw new Error(
      "CONTENT_REPO_URL is required when no local content directory exists."
    );
  }

  const stagingRoot = await mkdtemp(join(siteDir, ".content-sync-"));
  const stagedContent = join(stagingRoot, "content");
  const backupDir = `${contentDir}.backup-${randomUUID()}`;
  let existingContentMoved = false;
  let stagedContentInstalled = false;

  try {
    await execFileAsync("git", [
      "clone",
      "--depth",
      "1",
      "--branch",
      branch,
      "--single-branch",
      normalizedRemote,
      stagedContent,
    ]);
    await rm(join(stagedContent, ".git"), {
      recursive: true,
      force: true,
    });

    if (existsSync(contentDir)) {
      await rename(contentDir, backupDir);
      existingContentMoved = true;
    }

    await rename(stagedContent, contentDir);
    stagedContentInstalled = true;

    if (existingContentMoved) {
      await rm(backupDir, { recursive: true, force: true });
    }

    console.info(`[site] Content synchronized from ${normalizedRemote}.`);
    return { synced: true, contentDir };
  } catch (error) {
    if (
      existingContentMoved &&
      !stagedContentInstalled &&
      !existsSync(contentDir)
    ) {
      await rename(backupDir, contentDir);
    }
    throw error;
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }
};

const isDirectExecution =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  await syncContent();
}
