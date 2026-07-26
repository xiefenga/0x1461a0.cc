import { ContentManager } from "../core/content-manager";
import { GitAdapter } from "../storage/git-adapter";

import type { Config } from "../config/schema";
import type {
  ContentIndex,
  MetadataEntry,
  PublishOptions,
  PublishOutcome,
  WorkspaceSnapshot,
} from "../types";
import type { StorageAdapter } from "../storage/storage-adapter";

export class ContentValidationError extends Error {
  readonly snapshot: WorkspaceSnapshot;

  constructor(snapshot: WorkspaceSnapshot) {
    super(
      `Validation failed with ${snapshot.validation.errors.length} error(s)`
    );
    this.name = "ContentValidationError";
    this.snapshot = snapshot;
  }
}

export class CmsService {
  private readonly manager: ContentManager;
  private readonly storage: StorageAdapter;
  private operationQueue: Promise<void> = Promise.resolve();

  constructor(config: Config, storage: StorageAdapter = new GitAdapter(config)) {
    this.manager = new ContentManager(config);
    this.storage = storage;
  }

  async init(): Promise<void> {
    await this.runExclusive(() => this.manager.init());
  }

  async inspect(): Promise<WorkspaceSnapshot> {
    return this.runExclusive(() => this.inspectUnlocked());
  }

  private async inspectUnlocked(): Promise<WorkspaceSnapshot> {
    const entities = await this.manager.scan();
    const changeSet = await this.manager.getChangeSet();
    const validation = this.manager.validate();
    return { entities, changeSet, validation };
  }

  async updateMetadata(
    path: string,
    patch: Partial<MetadataEntry>
  ): Promise<WorkspaceSnapshot> {
    return this.runExclusive(async () => {
      await this.manager.updateMetadata(path, patch);
      return this.inspectUnlocked();
    });
  }

  async rebuildIndex(): Promise<ContentIndex> {
    return this.runExclusive(async () => {
      await this.manager.scan();
      return this.manager.rebuildIndex();
    });
  }

  async resetManifest(): Promise<void> {
    await this.runExclusive(() => this.manager.resetManifest());
  }

  async publish(options: PublishOptions = {}): Promise<PublishOutcome> {
    return this.runExclusive(async () => {
      const snapshot = await this.inspectUnlocked();
      const dryRun = options.dryRun ?? false;

      if (!snapshot.validation.valid) {
        throw new ContentValidationError(snapshot);
      }

      if (dryRun) {
        return { snapshot, dryRun };
      }

      const result = await this.storage.publish(
        snapshot.changeSet,
        snapshot.entities
      );

      if (result.success) {
        await this.manager.updateManifest();
        await this.manager.rebuildIndex();
      }

      return { snapshot, result, dryRun };
    });
  }

  getContentManager(): ContentManager {
    return this.manager;
  }

  private runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.operationQueue.then(operation, operation);
    this.operationQueue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }
}
