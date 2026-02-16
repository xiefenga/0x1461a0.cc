import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

import { rehypeCodeBlock } from "./plugins/markdown/rehype-code-block";
import { remarkSanitizeLinkHtml } from "./plugins/markdown/remark-sanitize-link-html";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  output: "static",
  adapter: vercel(),
  integrations: [mdx(), sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
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
    remarkPlugins: [remarkSanitizeLinkHtml],
    rehypePlugins: [rehypeCodeBlock],
    remarkRehype: {},
  },
});
