import { stringify as yamlStringify } from "yaml";
import type { MetadataEntry } from "../types";

export const injectFrontmatter = (body: string, meta: MetadataEntry): string => {
  const yamlContent = yamlStringify(meta).trimEnd();
  return `---\n${yamlContent}\n---\n\n${body}`;
};
