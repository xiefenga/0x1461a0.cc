import { defineCommand } from "citty";
import consola from "consola";
import { loadConfig, ContentManager, GitAdapter } from "@0x1461a0/0xmd-core";
import { handleError } from "../utils";

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
      const config = await loadConfig();
      const cm = new ContentManager(config);
      await cm.init();
      await cm.scan();

      // Validate first
      const validation = cm.validate();
      if (!validation.valid) {
        consola.error(`Validation failed with ${validation.errors.length} error(s):`);
        for (const err of validation.errors) {
          consola.error(`  [${err.entityId}] ${err.field}: ${err.message}`);
        }
        process.exit(1);
      }

      // Compute changeset
      const cs = await cm.getChangeSet();

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

      // Publish
      const adapter = new GitAdapter(config);
      const result = await adapter.publish(cs, cm.getEntities());

      if (result.success) {
        consola.success(
          `Published: ${result.published} written, ${result.removed} removed.`
        );
        if (result.commitHash) {
          consola.info(`  Commit: ${result.commitHash}`);
        }

        // Update manifest after successful publish
        await cm.updateManifest();
        await cm.rebuildIndex();
        consola.success("Manifest and index updated.");
      } else {
        consola.error("Publish failed:", result.message);
        process.exit(1);
      }
    } catch (error) {
      handleError(error);
    }
  },
});
