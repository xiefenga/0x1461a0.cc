import { contextBridge, ipcRenderer } from "electron";

const cmsApi = {
  inspect: (): Promise<unknown> => ipcRenderer.invoke("cms:inspect"),
  publish: (): Promise<unknown> => ipcRenderer.invoke("cms:publish"),
  updateMetadata: (
    path: string,
    patch: Record<string, unknown>
  ): Promise<unknown> =>
    ipcRenderer.invoke("cms:update-metadata", path, patch),
  rebuildIndex: (): Promise<void> => ipcRenderer.invoke("cms:rebuild-index"),
  resetManifest: (): Promise<unknown> =>
    ipcRenderer.invoke("cms:reset-manifest"),
  getContentDir: (): Promise<string> =>
    ipcRenderer.invoke("cms:get-content-dir"),
  openContentFile: (path: string): Promise<void> =>
    ipcRenderer.invoke("cms:open-content-file", path),
  openDashboard: (): void => ipcRenderer.send("cms:open-dashboard"),
  quit: (): void => ipcRenderer.send("cms:quit"),
  onWorkspaceChanged: (callback: (snapshot: unknown) => void): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      snapshot: unknown
    ): void => {
      callback(snapshot);
    };
    ipcRenderer.on("cms:workspace-changed", handler);
    return () => {
      ipcRenderer.removeListener("cms:workspace-changed", handler);
    };
  },
  onWorkspaceError: (callback: (message: string) => void): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      message: string
    ): void => {
      callback(message);
    };
    ipcRenderer.on("cms:workspace-error", handler);
    return () => {
      ipcRenderer.removeListener("cms:workspace-error", handler);
    };
  },
};

contextBridge.exposeInMainWorld("cmsApi", cmsApi);
