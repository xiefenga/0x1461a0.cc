# @0x1461a0.cc/site

Astro 7 + Panda CSS blog consuming the Git content repository published by 0xmd.

## Content contract

The site does not read the local `.0xmd/` state directory. Its build input is the
published Git repository containing Markdown with frontmatter:

```text
pure local Markdown + .0xmd/metadata.json
  -> 0xmd publish
  -> Git content repository with frontmatter
  -> site sync-content
  -> Astro glob loader
```

Supported published metadata:

- `title`
- `slug` (optional for legacy content; preferred for `/post/:slug/`)
- `tags`
- `description`
- `created`
- `updated`

## Environment

```dotenv
SITE_TITLE="0x1461a0's Blog"
CONTENT_LOADER_BASE="./content"
CONTENT_REPO_URL=https://github.com/example/content.git
CONTENT_REPO_BRANCH=main
```

`CONTENT_REPO_URL` should match `git.remote` in the 0xmd config.

When the remote is configured, `prebuild` clones into a temporary directory and
only replaces `content/` after a successful clone. Without a remote, existing
local content is preserved.

## Commands

```bash
pnpm dev
pnpm sync-content
pnpm build
pnpm test
```

Production deployment still needs an external trigger, such as a Vercel Deploy
Hook invoked after the content repository receives an 0xmd push.

## Styles and development

`panda.config.ts` owns design tokens, themes, and text styles. `src/styles/ui.ts`
owns shared layout and controls; `src/styles/global.css` handles generated Markdown
with Panda generated CSS variable references. Install runs `panda codegen`; PostCSS extracts CSS
from Astro/TypeScript during dev and build. `styled-system/` is generated and ignored.
Run `pnpm typecheck` for Astro + Panda diagnostics. The CMS retains Tailwind and Vite 6.

Fonts are self-hosted via Fontsource variable packages with CJK system fallbacks.
Markdown/MDX retain the unified processor for local remark/rehype plugins. The
published-content test checks Markdown, MDX, Shiki, enhanced code blocks and RSS.

Output remains static; ISR is a future content/runtime migration, not enabled here.
