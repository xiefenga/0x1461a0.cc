import type { ChangeSet, ContentEntity } from "../types";

export interface PublishResult {
  success: boolean;
  published: number;
  removed: number;
  commitHash?: string;
  message?: string;
}

export interface StorageAdapter {
  publish(
    changeSet: ChangeSet,
    allEntities: ContentEntity[]
  ): Promise<PublishResult>;
}
