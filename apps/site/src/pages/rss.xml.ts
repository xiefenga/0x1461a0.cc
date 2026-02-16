import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE } from "astro:env/server";

import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("blog");
  return rss({
    title: SITE_TITLE,
    description: SITE_TITLE,
    site: context.site!,
    items: posts.map((post) => ({
      ...post.data,
      link: `/post/${post.id}/`,
    })),
  });
}
