import { stringify as yamlStringify } from "yaml";
import type { MetadataEntry } from "../types";

export const hasFrontmatter = (body: string): boolean => {
  return /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(body);
};

export const injectFrontmatter = (body: string, meta: MetadataEntry): string => {
  const yamlContent = yamlStringify(meta).trimEnd();
  return `---\n${yamlContent}\n---\n\n${body}`;
};
