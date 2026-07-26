import { join } from "node:path";
import { BrowserWindow, shell, type Rectangle } from "electron";

const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT = 400;

let popoverWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

// ─── Popover Panel ──────────────────────────────────────────────

const loadRendererURL = (win: BrowserWindow, query: string): void => {
  if (process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}?view=${query}`);
  } else {
    win.loadFile(join(import.meta.dirname, "../renderer/index.html"), {
      query: { view: query },
    });
  }
};

export const createPopover = (): BrowserWindow => {
  popoverWindow = new BrowserWindow({
    width: POPOVER_WIDTH,
    height: POPOVER_HEIGHT,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: true,
    vibrancy: "popover",
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.mjs"),
      sandbox: false,
    },
  });

  popoverWindow.on("blur", () => {
    hidePopover();
  });

  loadRendererURL(popoverWindow, "popover");

  return popoverWindow;
};

export const getPopoverWindow = (): BrowserWindow | null => {
  return popoverWindow;
};

export const togglePopover = (trayBounds: Rectangle): void => {
  if (!popoverWindow || popoverWindow.isDestroyed()) {
    createPopover();
  }

  if (popoverWindow!.isVisible()) {
    hidePopover();
  } else {
    showPopover(trayBounds);
  }
};

const showPopover = (trayBounds: Rectangle): void => {
  if (!popoverWindow || popoverWindow.isDestroyed()) {
    return;
  }

  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - POPOVER_WIDTH / 2,
  );
  const y = Math.round(trayBounds.y + trayBounds.height);

  popoverWindow.setPosition(x, y, false);
  popoverWindow.show();
};

export const hidePopover = (): void => {
  if (popoverWindow && !popoverWindow.isDestroyed() && popoverWindow.isVisible()) {
    popoverWindow.hide();
  }
};

export const destroyPopover = (): void => {
  if (popoverWindow && !popoverWindow.isDestroyed()) {
    popoverWindow.removeAllListeners("blur");
    popoverWindow.close();
  }
  popoverWindow = null;
};

// ─── Dashboard Window ───────────────────────────────────────────

export const createWindow = (): BrowserWindow => {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 680,
    show: false,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.mjs"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("close", (e) => {
    e.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  loadRendererURL(mainWindow, "dashboard");

  return mainWindow;
};

export const getMainWindow = (): BrowserWindow | null => {
  return mainWindow;
};

export const showWindow = (): void => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
};

export const destroyWindow = (): void => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.removeAllListeners("close");
    mainWindow.close();
  }
  mainWindow = null;
};

// ─── Broadcast ──────────────────────────────────────────────────

export const broadcastToAllWindows = (channel: string, ...args: unknown[]): void => {
  const windows = [popoverWindow, mainWindow];
  for (const win of windows) {
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  }
};
