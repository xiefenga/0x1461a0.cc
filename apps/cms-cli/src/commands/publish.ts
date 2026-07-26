import { defineCommand } from "citty";
import consola from "consola";
import { ContentValidationError } from "@0x1461a0/0xmd-core";
import { createCmsService, handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "publish",
    description: "Validate, compute changes, and publish via git",
  },
  args: {
    "dry-run": {
      type: "boolean",
      description: "Show changes without actually publishing",
      default: false,
    },
    yes: {
      type: "boolean",
      alias: ["y"],
      description: "Skip confirmation prompt",
      default: false,
    },
  },
  run: async ({ args }) => {
    try {
      const service = await createCmsService();
      const snapshot = await service.inspect();
      const cs = snapshot.changeSet;

      if (!snapshot.validation.valid) {
        throw new ContentValidationError(snapshot);
      }

      if (
        cs.added.length === 0 &&
        cs.updated.length === 0 &&
        cs.removed.length === 0
      ) {
        consola.info("No changes to publish.");
        return;
      }

      // Show changes
      consola.info("Changes to publish:");
      if (cs.added.length > 0) {
        consola.info(`  + ${cs.added.length} added`);
      }
      if (cs.updated.length > 0) {
        consola.info(`  ~ ${cs.updated.length} updated`);
      }
      if (cs.removed.length > 0) {
        consola.info(`  - ${cs.removed.length} removed`);
      }

      // Dry run
      if (args["dry-run"]) {
        await service.publish({ dryRun: true });
        consola.info("\nDry run — no changes were published.");
        return;
      }

      // Confirm
      if (!args.yes) {
        const confirmed = await consola.prompt("Proceed with publish?", {
          type: "confirm",
        });

        if (!confirmed) {
          consola.info("Publish cancelled.");
          return;
        }
      }

      const { result } = await service.publish();

      if (result?.success) {
        consola.success(
          `Published: ${result.published} written, ${result.removed} removed.`
        );
        if (result.commitHash) {
          consola.info(`  Commit: ${result.commitHash}`);
        }

        consola.success("Manifest and index updated.");
      } else {
        consola.error("Publish failed:", result?.message);
        process.exit(1);
      }
    } catch (error) {
      if (error instanceof ContentValidationError) {
        consola.error(error.message);
        for (const validationError of error.snapshot.validation.errors) {
          consola.error(
            `  [${validationError.entityId}] ${validationError.field}: ${validationError.message}`
          );
        }
        process.exit(1);
      }
      handleError(error);
    }
  },
});
