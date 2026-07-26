# @0x1461a0.cc/site

基于 **Astro 5** 构建的个人博客，部署在 **Vercel**。静态生成，支持暗色模式、代码块增强和 View Transition API 页面过渡。站点语言为中文 (zh-CN)。

## 命令

- **开发服务器：** `pnpm dev`（监听 localhost:4321）
- **同步内容：** `pnpm sync-content`（安全克隆 `$CONTENT_REPO_URL`；缺失时保留本地 content）
- **构建：** `pnpm build`（`prebuild` 会先执行安全内容同步）
- **测试：** `pnpm test`（本地 Git 同步测试 + 0xmd 发布 frontmatter 渲染 E2E）
- **预览：** `pnpm preview`
- **Astro CLI：** `pnpm astro`

## 技术栈

Astro 5 + TypeScript (strict) + React 19 + Tailwind CSS 4 + MDX

## 架构

**内容系统：** 博客文章来自 0xmd 发布的 Git 内容仓库。站点不读取 `.0xmd/`，而是消费发布后带 frontmatter 的 Markdown。`prebuild` 先克隆到临时目录，成功后才替换 `content/`；未配置 remote 时保留本地内容。Astro Content Collections 使用 glob loader，schema 为 `title`、可选 `slug`、`tags`、`description`、`created`、`updated`。页面路由优先使用 metadata slug，旧内容回退到 loader id。

**路径别名：** `~/*` 映射到 `./src/*`（配置在 `tsconfig.json`）。

**关键目录：**
- `src/pages/` — 路由：首页（文章列表）、`post/[...slug]`（文章详情）、`rss.xml.ts`（RSS 订阅）
- `src/components/` — Astro 组件（header、footer、post-list、theme-toggle 等）
- `src/layouts/` — `base-layout.astro` 包裹所有页面
- `src/styles/global.css` — Tailwind 导入、自定义滚动条/代码块样式、暗色模式
- `plugins/markdown/` — 自定义 rehype/remark 插件

**Markdown 插件（`plugins/markdown/`）：**
- `rehype-code-block.ts` — 为 `<pre>` 代码块添加语言标签和复制按钮
- `remark-sanitize-link-html.ts` — 防止 markdown 链接文本中的 HTML 标签被解析

**语法高亮：** Shiki 双主题 — "vitesse-light"（亮色）和 "vitesse-dark"（暗色），配置在 `astro.config.ts`。

**暗色模式：** 通过 theme toggle 组件实现，使用 View Transition API 做过渡动画。CSS 通过 `<html>` 上的 `.dark` 类切换。

**环境变量**（服务端，定义在 `astro.config.ts` 的 `env.schema`）：
- `SITE_TITLE` — 博客标题
- `CONTENT_LOADER_BASE` — 内容目录路径
- `CONTENT_REPO_URL` — 0xmd 发布的 Git 内容仓库，应与 0xmd `git.remote` 一致
- `CONTENT_REPO_BRANCH` — 内容仓库分支，默认 `main`

## 约定

- 所有组件为 Astro 组件（`.astro`）；React 用于交互式 island
