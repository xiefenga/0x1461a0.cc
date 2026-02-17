import { defineCommand } from "citty";
import consola from "consola";
import { createContentManager, handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "build-index",
    description: "Rebuild content index",
  },
  run: async () => {
    try {
      const cm = await createContentManager();
      await cm.scan();
      const index = await cm.rebuildIndex();

      const count = Object.keys(index.byId).length;
      consola.success(`Index rebuilt with ${count} entries.`);
    } catch (error) {
      handleError(error);
    }
  },
});
