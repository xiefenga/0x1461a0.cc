import { CmsService, loadConfig } from "@0x1461a0/0xmd-core";
import consola from "consola";

export const createCmsService = async (): Promise<CmsService> => {
  const config = await loadConfig();
  const service = new CmsService(config);
  await service.init();
  return service;
};

export const handleError = (error: unknown): never => {
  if (error instanceof Error) {
    consola.error(error.message);
  } else {
    consola.error("An unexpected error occurred", error);
  }
  process.exit(1);
};
