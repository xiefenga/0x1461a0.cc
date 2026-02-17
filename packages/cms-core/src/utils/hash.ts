import { createHash } from "node:crypto";
import type { MetadataEntry } from "../types";

export const computeHash = (meta: MetadataEntry, body: string): string => {
  return createHash("sha256")
    .update(JSON.stringify(meta) + body)
    .digest("hex");
};
