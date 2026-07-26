import { getCollection } from "astro:content";

import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export const getPostSlug = (post: BlogPost): string => {
  return post.data.slug ?? post.id;
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const posts = await getCollection("blog");
  const routeOwners = new Map<string, string>();

  for (const post of posts) {
    const slug = getPostSlug(post);
    const existing = routeOwners.get(slug);
    if (existing) {
      throw new Error(
        `Duplicate published slug "${slug}" in "${existing}" and "${post.id}"`
      );
    }
    routeOwners.set(slug, post.id);
  }

  return posts.sort(
    (a, b) => b.data.created.valueOf() - a.data.created.valueOf()
  );
};
