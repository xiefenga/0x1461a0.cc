import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { unified } from "@astrojs/markdown-remark";
import { defineConfig, envField } from "astro/config";

import { rehypeCodeBlock } from "./plugins/markdown/rehype-code-block";
import { remarkSanitizeLinkHtml } from "./plugins/markdown/remark-sanitize-link-html";

// https://astro.build/config
export default defineConfig({
  site: "https://www.0x1461a0.cc",
  output: "static",
  adapter: vercel(),
  integrations: [mdx(), sitemap(), react()],
  env: {
    schema: {
      SITE_TITLE: envField.string({
        context: "server",
        access: "public",
      }),
      CONTENT_LOADER_BASE: envField.string({
        context: "server",
        access: "public",
      }),
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
    },
    processor: unified({
      remarkPlugins: [remarkSanitizeLinkHtml],
      rehypePlugins: [rehypeCodeBlock],
    }),
  },
});
