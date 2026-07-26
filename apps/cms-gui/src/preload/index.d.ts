declare global {
interface CmsApi {
  inspect: () => Promise<WorkspaceSnapshotDTO>;
  publish: () => Promise<PublishOutcomeDTO>;
  updateMetadata: (
    path: string,
    patch: MetadataPatchDTO
  ) => Promise<WorkspaceSnapshotDTO>;
  rebuildIndex: () => Promise<void>;
  resetManifest: () => Promise<WorkspaceSnapshotDTO>;
  getContentDir: () => Promise<string>;
  openContentFile: (path: string) => Promise<void>;
  openDashboard: () => void;
  quit: () => void;
  onWorkspaceChanged: (
    callback: (snapshot: WorkspaceSnapshotDTO) => void
  ) => () => void;
  onWorkspaceError: (callback: (message: string) => void) => () => void;
}

interface MetadataDTO {
  title: string;
  slug: string;
  tags: string[];
  description: string;
  created: string;
  updated: string;
}

type MetadataPatchDTO = Partial<MetadataDTO>;

interface ContentEntityDTO {
  id: string;
  slug: string;
  path: string;
  metadata: MetadataDTO;
  hash: string;
}

interface ChangeItemDTO {
  id: string;
  path: string;
}

interface ValidationErrorDTO {
  entityId: string;
  field: string;
  message: string;
}

interface WorkspaceSnapshotDTO {
  entities: ContentEntityDTO[];
  changeSet: {
    added: ChangeItemDTO[];
    updated: ChangeItemDTO[];
    removed: ChangeItemDTO[];
  };
  validation: {
    valid: boolean;
    errors: ValidationErrorDTO[];
  };
}

interface PublishOutcomeDTO {
  snapshot: WorkspaceSnapshotDTO;
  result?: {
    success: boolean;
    published: number;
    removed: number;
    commitHash?: string;
    message?: string;
  };
  dryRun: boolean;
}

  interface Window {
    cmsApi: CmsApi;
  }
}

export {};
