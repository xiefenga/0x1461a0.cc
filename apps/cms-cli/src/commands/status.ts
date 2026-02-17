import { defineCommand } from "citty";
import consola from "consola";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getConfigPath, getDataDir, loadConfig } from "@0x1461a0/0xmd-core";
import { handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "status",
    description: "Show 0xmd configuration and content status",
  },
  run: async () => {
    try {
      const configPath = getConfigPath();

      // Config
      consola.info(`Config: ${configPath}`);
      if (!existsSync(configPath)) {
        consola.warn("  Config file not found. Run `0xmd init` to create one.");
        return;
      }

      const config = await loadConfig();
      consola.info(`Content dir: ${config.contentDir}`);
      consola.info(`Git remote:  ${config.git.remote}`);
      consola.info(`Git branch:  ${config.git.branch}`);
      consola.info(`Patterns:    ${config.patterns.join(", ")}`);

      // Data dir
      const dataDir = getDataDir(config.contentDir);
      consola.info(`Data dir:    ${dataDir}`);

      if (!existsSync(dataDir)) {
        consola.warn("  Data directory does not exist yet. Run `0xmd scan` first.");
        return;
      }

      // Metadata
      const metadataPath = join(dataDir, "metadata.json");
      if (existsSync(metadataPath)) {
        const raw = JSON.parse(await readFile(metadataPath, "utf-8"));
        const count = Object.keys(raw).length;
        consola.info(`Metadata:    ${count} entries`);
      } else {
        consola.info("Metadata:    not created");
      }

      // Manifest
      const manifestPath = join(dataDir, "manifest.json");
      if (existsSync(manifestPath)) {
        const raw = JSON.parse(await readFile(manifestPath, "utf-8"));
        const count = Object.keys(raw).length;
        consola.info(`Manifest:    ${count} entries`);
      } else {
        consola.info("Manifest:    not created (all files will be treated as new)");
      }

      // Path map
      const pathMapPath = join(dataDir, "path-map.json");
      if (existsSync(pathMapPath)) {
        const raw = JSON.parse(await readFile(pathMapPath, "utf-8"));
        const count = Object.keys(raw).length;
        consola.info(`Path map:    ${count} entries`);
      } else {
        consola.info("Path map:    not created");
      }

      // Index
      const indexPath = join(dataDir, "index.json");
      consola.info(`Index:       ${existsSync(indexPath) ? "exists" : "not created"}`);
    } catch (error) {
      handleError(error);
    }
  },
});
