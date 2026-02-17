import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

export const ensureDir = async (dirPath: string): Promise<void> => {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
};

export const atomicWrite = async (
  filePath: string,
  data: string
): Promise<void> => {
  await ensureDir(dirname(filePath));
  const tmpPath = filePath + ".tmp";
  await writeFile(tmpPath, data, "utf-8");
  await rename(tmpPath, filePath);
};

export const readJsonFile = async <T>(filePath: string): Promise<T | null> => {
  if (!existsSync(filePath)) {
    return null;
  }
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
};

export const writeJsonFile = async (
  filePath: string,
  data: unknown
): Promise<void> => {
  await atomicWrite(filePath, JSON.stringify(data, null, 2) + "\n");
};
