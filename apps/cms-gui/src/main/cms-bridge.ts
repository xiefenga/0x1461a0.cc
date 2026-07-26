import {
  CmsService,
  loadConfig,
} from "@0x1461a0/0xmd-core";

import type {
  Config,
  ContentEntity,
  MetadataEntry,
  PublishOutcome,
  WorkspaceSnapshot,
} from "@0x1461a0/0xmd-core";

export type ContentEntityDto = Omit<ContentEntity, "body">;

export interface ChangeItemDto {
  id: string;
  path: string;
}

export interface WorkspaceSnapshotDto {
  entities: ContentEntityDto[];
  changeSet: {
    added: ChangeItemDto[];
    updated: ChangeItemDto[];
    removed: ChangeItemDto[];
  };
  validation: WorkspaceSnapshot["validation"];
}

export interface PublishOutcomeDto {
  snapshot: WorkspaceSnapshotDto;
  result: PublishOutcome["result"];
  dryRun: boolean;
}

let config: Config | null = null;
let service: CmsService | null = null;

export const getConfig = async (): Promise<Config> => {
  if (!config) {
    config = await loadConfig();
  }
  return config;
};

export const getCmsService = async (): Promise<CmsService> => {
  if (!service) {
    const loadedConfig = await getConfig();
    service = new CmsService(loadedConfig);
    await service.init();
  }
  return service;
};

export const inspectWorkspace = async (): Promise<WorkspaceSnapshotDto> => {
  const cms = await getCmsService();
  return toSnapshotDto(await cms.inspect());
};

export const publishContent = async (): Promise<PublishOutcomeDto> => {
  const cms = await getCmsService();
  const outcome = await cms.publish();
  return {
    snapshot: toSnapshotDto(outcome.snapshot),
    result: outcome.result,
    dryRun: outcome.dryRun,
  };
};

export const updateContentMetadata = async (
  path: string,
  patch: Partial<MetadataEntry>
): Promise<WorkspaceSnapshotDto> => {
  const cms = await getCmsService();
  return toSnapshotDto(await cms.updateMetadata(path, patch));
};

export const rebuildContentIndex = async (): Promise<void> => {
  const cms = await getCmsService();
  await cms.rebuildIndex();
};

export const resetContentManifest = async (): Promise<void> => {
  const cms = await getCmsService();
  await cms.resetManifest();
};

export const getContentDir = async (): Promise<string> => {
  const loadedConfig = await getConfig();
  return loadedConfig.contentDir;
};

const toSnapshotDto = (
  snapshot: WorkspaceSnapshot
): WorkspaceSnapshotDto => {
  return {
    entities: snapshot.entities.map(stripBody),
    changeSet: {
      added: snapshot.changeSet.added.map(toChangeItem),
      updated: snapshot.changeSet.updated.map(toChangeItem),
      removed: snapshot.changeSet.removed,
    },
    validation: snapshot.validation,
  };
};

const stripBody = (entity: ContentEntity): ContentEntityDto => {
  const { body: _, ...dto } = entity;
  return dto;
};

const toChangeItem = (entity: ContentEntity): ChangeItemDto => {
  return { id: entity.id, path: entity.path };
};
