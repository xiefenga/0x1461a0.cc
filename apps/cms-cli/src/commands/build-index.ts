import { defineCommand } from "citty";
import consola from "consola";
import { createCmsService, handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "build-index",
    description: "Rebuild content index",
  },
  run: async () => {
    try {
      const service = await createCmsService();
      const index = await service.rebuildIndex();

      const count = Object.keys(index.byId).length;
      consola.success(`Index rebuilt with ${count} entries.`);
    } catch (error) {
      handleError(error);
    }
  },
});
