import { defineCommand } from "citty";
import consola from "consola";
import { createCmsService, handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "validate",
    description: "Validate content metadata",
  },
  run: async () => {
    try {
      const service = await createCmsService();
      const { validation: result } = await service.inspect();

      if (result.valid) {
        consola.success("All content is valid.");
      } else {
        consola.error(`Found ${result.errors.length} validation error(s):`);
        for (const err of result.errors) {
          consola.error(`  [${err.entityId}] ${err.field}: ${err.message}`);
        }
        process.exit(1);
      }
    } catch (error) {
      handleError(error);
    }
  },
});
