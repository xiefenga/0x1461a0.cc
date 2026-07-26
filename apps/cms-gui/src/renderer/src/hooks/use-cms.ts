import { useCallback, useEffect, useMemo, useState } from "react";

const EMPTY_SNAPSHOT: WorkspaceSnapshotDTO = {
  entities: [],
  changeSet: {
    added: [],
    updated: [],
    removed: [],
  },
  validation: {
    valid: true,
    errors: [],
  },
};

export const useCms = () => {
  const [snapshot, setSnapshot] =
    useState<WorkspaceSnapshotDTO>(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPublish, setLastPublish] =
    useState<PublishOutcomeDTO["result"]>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSnapshot(await window.cmsApi.inspect());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const publish = useCallback(async () => {
    setPublishing(true);
    setError(null);
    try {
      const outcome = await window.cmsApi.publish();
      setSnapshot(outcome.snapshot);
      setLastPublish(outcome.result);
      return outcome;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }, []);

  const updateMetadata = useCallback(
    async (path: string, patch: MetadataPatchDTO) => {
      setLoading(true);
      setError(null);
      try {
        setSnapshot(await window.cmsApi.updateMetadata(path, patch));
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Metadata update failed"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribeWorkspace = window.cmsApi.onWorkspaceChanged(setSnapshot);
    const unsubscribeError = window.cmsApi.onWorkspaceError(setError);

    return () => {
      unsubscribeWorkspace();
      unsubscribeError();
    };
  }, []);

  const pendingCount = useMemo(() => {
    return (
      snapshot.changeSet.added.length +
      snapshot.changeSet.updated.length +
      snapshot.changeSet.removed.length
    );
  }, [snapshot.changeSet]);

  return {
    snapshot,
    entities: snapshot.entities,
    pendingCount,
    loading,
    publishing,
    error,
    lastPublish,
    refresh,
    publish,
    updateMetadata,
  };
};
