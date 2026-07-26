import { existsSync } from "node:fs";
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CmsService, ContentValidationError } from "../cms-service";
import type { Config } from "../../config/schema";
import type {
  ChangeSet,
  ContentEntity,
} from "../../types";
import type {
  PublishResult,
  StorageAdapter,
} from "../../storage/storage-adapter";

class RecordingStorage implements StorageAdapter {
  calls: ChangeSet[] = [];

  async publish(
    changeSet: ChangeSet,
    _allEntities: ContentEntity[]
  ): Promise<PublishResult> {
    this.calls.push(changeSet);
    return {
      success: true,
      published: changeSet.added.length + changeSet.updated.length,
      removed: changeSet.removed.length,
      commitHash: "test-commit",
    };
  }
}

describe("CmsService", () => {
  let contentDir: string;
  let config: Config;
  let storage: RecordingStorage;

  beforeEach(async () => {
    contentDir = await mkdtemp(join(tmpdir(), "0xmd-service-"));
    config = {
      contentDir,
      git: {
        remote: "unused",
        branch: "main",
      },
      patterns: ["**/*.md"],
    };
    storage = new RecordingStorage();
  });

  afterEach(async () => {
    await rm(contentDir, { recursive: true, force: true });
  });

  it("shares inspect, metadata, dry-run, and publish orchestration", async () => {
    const sourcePath = join(contentDir, "post.md");
    const source = "# Plain Markdown\n";
    await writeFile(sourcePath, source);

    const service = new CmsService(config, storage);
    await service.init();

    const initial = await service.inspect();
    expect(initial.changeSet.added).toHaveLength(1);
    expect(initial.validation.valid).toBe(true);

    const edited = await service.updateMetadata("post.md", {
      title: "External title",
      tags: ["cms"],
    });
    expect(edited.entities[0].metadata.title).toBe("External title");
    expect(await readFile(sourcePath, "utf-8")).toBe(source);

    await service.publish({ dryRun: true });
    expect(storage.calls).toHaveLength(0);
    expect(
      existsSync(join(contentDir, ".0xmd", "manifest.json"))
    ).toBe(false);

    const outcome = await service.publish();
    expect(outcome.result?.commitHash).toBe("test-commit");
    expect(storage.calls).toHaveLength(1);

    const synced = await service.inspect();
    expect(synced.changeSet).toEqual({
      added: [],
      updated: [],
      removed: [],
    });
  });

  it("blocks publishing invalid source Markdown before storage", async () => {
    await writeFile(
      join(contentDir, "post.md"),
      "---\ntitle: Inline metadata\n---\n\n# Body\n"
    );

    const service = new CmsService(config, storage);
    await service.init();

    await expect(service.publish()).rejects.toBeInstanceOf(
      ContentValidationError
    );
    expect(storage.calls).toHaveLength(0);
  });

  it("serializes concurrent inspect calls and honors preserve policy", async () => {
    config.frontmatter = { policy: "preserve" };
    await writeFile(
      join(contentDir, "legacy.md"),
      "---\ntitle: Legacy\n---\n\n# Body\n"
    );

    const service = new CmsService(config, storage);
    await service.init();
    const snapshots = await Promise.all([
      service.inspect(),
      service.inspect(),
      service.inspect(),
    ]);

    expect(snapshots).toHaveLength(3);
    expect(snapshots.every((snapshot) => snapshot.validation.valid)).toBe(true);
  });
});
