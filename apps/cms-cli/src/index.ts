import { defineCommand, runMain } from "citty";
import init from "./commands/init";
import scan from "./commands/scan";
import diff from "./commands/diff";
import validate from "./commands/validate";
import buildIndex from "./commands/build-index";
import resetManifest from "./commands/reset-manifest";
import publish from "./commands/publish";
import status from "./commands/status";
import metadata from "./commands/metadata";

const main = defineCommand({
  meta: {
    name: "0xmd",
    version: "0.2.0",
    description: "Local-first Markdown content manager",
  },
  subCommands: {
    init,
    status,
    scan,
    metadata,
    diff,
    validate,
    "build-index": buildIndex,
    "reset-manifest": resetManifest,
    publish,
  },
});

runMain(main);
