# @0x1461a0.cc/site

Astro blog consuming the Git content repository published by 0xmd.

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
