import { defineCommand } from "citty";
import consola from "consola";
import { createCmsService, handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "diff",
    description: "Show content changes (added/updated/removed)",
  },
  run: async () => {
    try {
      const service = await createCmsService();
      const { changeSet: cs } = await service.inspect();

      if (
        cs.added.length === 0 &&
        cs.updated.length === 0 &&
        cs.removed.length === 0
      ) {
        consola.info("No changes detected.");
        return;
      }

      if (cs.added.length > 0) {
        consola.success(`Added (${cs.added.length}):`);
        for (const e of cs.added) {
          consola.info(`  + ${e.id} — ${e.path}`);
        }
      }

      if (cs.updated.length > 0) {
        consola.warn(`Updated (${cs.updated.length}):`);
        for (const e of cs.updated) {
          consola.info(`  ~ ${e.id} — ${e.path}`);
        }
      }

      if (cs.removed.length > 0) {
        consola.error(`Removed (${cs.removed.length}):`);
        for (const e of cs.removed) {
          consola.info(`  - ${e.id} — ${e.path}`);
        }
      }

      consola.info(
        `\nSummary: ${cs.added.length} added, ${cs.updated.length} updated, ${cs.removed.length} removed`
      );
    } catch (error) {
      handleError(error);
    }
  },
});
