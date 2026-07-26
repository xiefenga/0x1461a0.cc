import { app } from "electron";
import { createTray, destroyTray } from "./tray";
import { destroyWindow, destroyPopover, getMainWindow } from "./windows";
import { registerIpcHandlers } from "./ipc";
import { startWatcher, stopWatcher } from "./watcher";
import { getConfig } from "./cms-bridge";

// macOS: hide dock icon — this is a tray-only app
if (process.platform === "darwin") {
  app.dock?.hide();
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      }
      win.show();
      win.focus();
    }
  });

  app.whenReady().then(async () => {
    registerIpcHandlers();
    createTray();

    // Start file watcher
    try {
      const config = await getConfig();
      startWatcher(config.contentDir, config.patterns);
    } catch {
      // Config may not exist yet — watcher will not start
    }
  });

  app.on("before-quit", async () => {
    destroyTray();
    await stopWatcher();
    destroyPopover();
    destroyWindow();
  });

  // macOS: keep app running when all windows are closed (tray app)
  app.on("window-all-closed", () => {
    // Do not quit — this is a tray-resident app
  });
}
