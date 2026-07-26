import { watch, type FSWatcher } from "chokidar";
import { inspectWorkspace } from "./cms-bridge";
import { broadcastToAllWindows } from "./windows";

let watcher: FSWatcher | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const DEBOUNCE_MS = 500;

export const startWatcher = (contentDir: string, patterns: string[]): void => {
  if (watcher) {
    return;
  }

  const globs = patterns.map((p) => `${contentDir}/${p}`);

  watcher = watch(globs, {
    ignoreInitial: true,
    ignored: ["**/.0xmd/**", "**/node_modules/**"],
  });

  const notify = (): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(async () => {
      try {
        const snapshot = await inspectWorkspace();
        broadcastToAllWindows("cms:workspace-changed", snapshot);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Workspace refresh failed";
        broadcastToAllWindows("cms:workspace-error", message);
      }
    }, DEBOUNCE_MS);
  };

  watcher.on("add", notify);
  watcher.on("change", notify);
  watcher.on("unlink", notify);
};

export const stopWatcher = async (): Promise<void> => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (watcher) {
    await watcher.close();
    watcher = null;
  }
};
