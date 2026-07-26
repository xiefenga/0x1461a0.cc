import { defineCommand } from "citty";
import consola from "consola";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { stringify as yamlStringify } from "yaml";
import { getConfigPath } from "@0x1461a0/0xmd-core";
import { handleError } from "../utils";

export default defineCommand({
  meta: {
    name: "init",
    description: "Create 0xmd config file interactively",
  },
  run: async () => {
    try {
      const configPath = getConfigPath();

      if (existsSync(configPath)) {
        consola.warn(`Config already exists: ${configPath}`);
        const overwrite = await consola.prompt("Overwrite?", {
          type: "confirm",
        });
        if (!overwrite) {
          consola.info("Cancelled.");
          return;
        }
      }

      const contentDir = await consola.prompt("Content directory (absolute path):", {
        type: "text",
        placeholder: "/path/to/your/content",
      });

      if (!contentDir || typeof contentDir !== "string") {
        consola.error("Content directory is required.");
        process.exit(1);
      }

      if (!existsSync(contentDir)) {
        consola.warn(`Directory does not exist: ${contentDir}`);
        consola.warn("You can create it later, but 0xmd commands will fail until it exists.");
      }

      const remote = await consola.prompt("Git remote URL:", {
        type: "text",
        placeholder: "git@github.com:user/content-repo.git",
      });

      if (!remote || typeof remote !== "string") {
        consola.error("Git remote is required.");
        process.exit(1);
      }

      const branch = await consola.prompt("Git branch:", {
        type: "text",
        default: "main",
      });

      const patternsInput = await consola.prompt("File patterns (comma-separated):", {
        type: "text",
        default: "**/*.md",
      });

      const patterns = (typeof patternsInput === "string" && patternsInput)
        ? patternsInput.split(",").map((p) => p.trim()).filter(Boolean)
        : ["**/*.md"];

      const preserveFrontmatter = await consola.prompt(
        "Preserve frontmatter already present in source Markdown?",
        {
          type: "confirm",
          default: false,
        }
      );

      const config = {
        contentDir,
        git: {
          remote,
          branch: (typeof branch === "string" && branch) ? branch : "main",
        },
        patterns,
        frontmatter: {
          policy: preserveFrontmatter ? "preserve" : "forbid",
        },
      };

      await mkdir(dirname(configPath), { recursive: true });
      await writeFile(configPath, yamlStringify(config), "utf-8");

      consola.success(`Config created: ${configPath}`);
    } catch (error) {
      handleError(error);
    }
  },
});
