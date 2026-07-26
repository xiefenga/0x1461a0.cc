import { defineCommand } from "citty";
import consola from "consola";

import { createCmsService, handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "metadata",
    description: "Update metadata stored outside the Markdown source",
  },
  args: {
    path: {
      type: "positional",
      description: "Content path relative to the configured content directory",
      required: true,
    },
    title: {
      type: "string",
      description: "Post title",
    },
    slug: {
      type: "string",
      description: "URL slug",
    },
    tags: {
      type: "string",
      description: "Comma-separated tags",
    },
    description: {
      type: "string",
      description: "Post description",
    },
  },
  run: async ({ args }) => {
    try {
      const patch = {
        ...(args.title !== undefined ? { title: args.title } : {}),
        ...(args.slug !== undefined ? { slug: args.slug } : {}),
        ...(args.tags !== undefined
          ? {
              tags: args.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            }
          : {}),
        ...(args.description !== undefined
          ? { description: args.description }
          : {}),
      };

      if (Object.keys(patch).length === 0) {
        throw new Error(
          "Provide at least one of --title, --slug, --tags, or --description"
        );
      }

      const service = await createCmsService();
      const snapshot = await service.updateMetadata(args.path, patch);
      const entity = snapshot.entities.find((entry) => entry.path === args.path);
      consola.success(`Metadata updated: ${args.path}`);
      if (entity) {
        consola.info(`  title: ${entity.metadata.title}`);
        consola.info(`  slug:  ${entity.slug}`);
        consola.info(`  tags:  ${entity.metadata.tags.join(", ") || "(none)"}`);
      }
    } catch (error) {
      handleError(error);
    }
  },
});
