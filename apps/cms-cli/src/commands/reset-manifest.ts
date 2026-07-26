import { defineCommand } from "citty";
import consola from "consola";
import { createCmsService, handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "reset-manifest",
    description: "Reset manifest to empty (marks all content as new)",
  },
  run: async () => {
    try {
      const service = await createCmsService();
      await service.resetManifest();
      consola.success("Manifest has been reset.");
    } catch (error) {
      handleError(error);
    }
  },
});
