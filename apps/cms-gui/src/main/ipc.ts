import { resolve, sep } from "node:path";

import { app, ipcMain, shell } from "electron";
import type { MetadataEntry } from "@0x1461a0/0xmd-core";

import {
  getContentDir,
  inspectWorkspace,
  publishContent,
  rebuildContentIndex,
  resetContentManifest,
  updateContentMetadata,
} from "./cms-bridge";
import { showWindow, hidePopover, broadcastToAllWindows } from "./windows";

export const registerIpcHandlers = (): void => {
  ipcMain.handle("cms:inspect", async () => {
    const snapshot = await inspectWorkspace();
    broadcastToAllWindows("cms:workspace-changed", snapshot);
    return snapshot;
  });

  ipcMain.handle("cms:publish", async () => {
    const outcome = await publishContent();
    broadcastToAllWindows("cms:workspace-changed", outcome.snapshot);
    return outcome;
  });

  ipcMain.handle(
    "cms:update-metadata",
    async (_event, path: string, patch: Partial<MetadataEntry>) => {
      const snapshot = await updateContentMetadata(path, patch);
      broadcastToAllWindows("cms:workspace-changed", snapshot);
      return snapshot;
    }
  );

  ipcMain.handle("cms:rebuild-index", async () => {
    await rebuildContentIndex();
  });

  ipcMain.handle("cms:reset-manifest", async () => {
    await resetContentManifest();
    const snapshot = await inspectWorkspace();
    broadcastToAllWindows("cms:workspace-changed", snapshot);
    return snapshot;
  });

  ipcMain.handle("cms:get-content-dir", async () => {
    return getContentDir();
  });

  ipcMain.handle("cms:open-content-file", async (_event, path: string) => {
    const contentDir = resolve(await getContentDir());
    const target = resolve(contentDir, path);
    if (target === contentDir || !target.startsWith(`${contentDir}${sep}`)) {
      throw new Error(`Refusing to open a path outside contentDir: ${path}`);
    }
    const message = await shell.openPath(target);
    if (message) {
      throw new Error(message);
    }
  });

  ipcMain.on("cms:open-dashboard", () => {
    hidePopover();
    showWindow();
  });

  ipcMain.on("cms:quit", () => {
    app.exit(0);
  });
};
