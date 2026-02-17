import * as yaml from 'yaml'
import { homedir } from "node:os";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { readFile } from "node:fs/promises";

import { ConfigSchema } from "./schema";

import type { Config } from "./schema";

const CONFIG_DIR = ".0xmd";
const CONFIG_FILE = "0xmd.config.yml";

export const getConfigPath = (): string => {
  return join(homedir(), CONFIG_DIR, CONFIG_FILE);
};

export const getDataDir = (contentDir: string): string => {
  return join(contentDir, CONFIG_DIR);
};

const resolvePath = (p: string): string => {
  if (p.startsWith("~")) {
    return resolve(join(homedir(), p.slice(1)));
  }
  return resolve(p);
};

export const loadConfig = async (configPath?: string): Promise<Config> => {
  const path = configPath ?? getConfigPath();

  if (!existsSync(path)) {
    throw new Error(`Config file not found: ${path}`);
  }

  const raw = await readFile(path, "utf-8");
  const parsed = yaml.parse(raw);
  const config = ConfigSchema.parse(parsed);

  // Resolve ~ in paths
  config.contentDir = resolvePath(config.contentDir);
  if (config.git.cloneDir) {
    config.git.cloneDir = resolvePath(config.git.cloneDir);
  }

  return config;
};
