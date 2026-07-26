import rss from "@astrojs/rss";
import { SITE_TITLE } from "astro:env/server";
import { getBlogPosts, getPostSlug } from "~/lib/posts";

import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getBlogPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_TITLE,
    site: context.site!,
    items: posts.map((post) => ({
      ...post.data,
      link: `/post/${getPostSlug(post)}/`,
    })),
  });
}
