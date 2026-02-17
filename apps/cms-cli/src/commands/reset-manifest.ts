import { defineCommand } from "citty";
import consola from "consola";
import { createContentManager, handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "reset-manifest",
    description: "Reset manifest to empty (marks all content as new)",
  },
  run: async () => {
    try {
      const cm = await createContentManager();
      await cm.resetManifest();
      consola.success("Manifest has been reset.");
    } catch (error) {
      handleError(error);
    }
  },
});
