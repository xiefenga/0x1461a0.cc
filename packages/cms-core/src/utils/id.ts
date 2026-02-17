import { slugify } from "transliteration";

/**
 * Generate a stable ID from the file path (relative to contentDir).
 * ID is path-based and does not change when title/slug changes.
 *
 * Example: "posts/你好世界.md" -> "posts-ni-hao-shi-jie"
 */
export const generateId = (filePath: string): string => {
  const withoutExt = filePath.replace(/\.mdx?$/, "");
  return slugify(withoutExt, { separator: "-" });
};

/**
 * Generate a URL-friendly slug.
 * Priority: metadata.slug > slugify(metadata.title) > slugify(filePath)
 */
export const generateSlug = (
  meta: { slug?: string; title?: string },
  filePath: string
): string => {
  if (meta.slug) {
    return meta.slug;
  }
  if (meta.title) {
    return slugify(meta.title, { separator: "-" });
  }
  return generateId(filePath);
};
