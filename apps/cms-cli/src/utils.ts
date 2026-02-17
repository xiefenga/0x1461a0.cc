import { loadConfig, ContentManager } from "@0x1461a0/0xmd-core";
import consola from "consola";

export const createContentManager = async (): Promise<ContentManager> => {
  const config = await loadConfig();
  const cm = new ContentManager(config);
  await cm.init();
  return cm;
};

export const handleError = (error: unknown): never => {
  if (error instanceof Error) {
    consola.error(error.message);
  } else {
    consola.error("An unexpected error occurred", error);
  }
  process.exit(1);
};
