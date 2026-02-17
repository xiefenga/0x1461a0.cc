import { defineCommand } from "citty";
import consola from "consola";
import { createContentManager, handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "scan",
    description: "Scan content directory and detect files",
  },
  run: async () => {
    try {
      const cm = await createContentManager();
      const entities = await cm.scan();

      if (entities.length === 0) {
        consola.info("No content files found.");
        return;
      }

      consola.success(`Found ${entities.length} content file(s):\n`);
      for (const entity of entities) {
        consola.info(`  ${entity.id}`);
        consola.info(`    path:  ${entity.path}`);
        consola.info(`    slug:  ${entity.slug}`);
        consola.info(`    title: ${entity.metadata.title}`);
        if (entity.metadata.tags.length > 0) {
          consola.info(`    tags:  ${entity.metadata.tags.join(", ")}`);
        }
        consola.info("");
      }
    } catch (error) {
      handleError(error);
    }
  },
});
