import { join } from "node:path";
import { nativeImage, Tray } from "electron";
import { createPopover, togglePopover } from "./windows";

let tray: Tray | null = null;

export const createTray = (): Tray => {
  const iconPath = join(
    import.meta.dirname,
    "../../resources/iconTemplate.png",
  );
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip("0xmd CMS");

  // Pre-create the popover window so first click is instant
  createPopover();

  tray.on("click", () => {
    if (!tray) {
      return;
    }
    togglePopover(tray.getBounds());
  });

  return tray;
};

export const getTray = (): Tray | null => {
  return tray;
};

export const destroyTray = (): void => {
  if (tray) {
    tray.destroy();
    tray = null;
  }
};
