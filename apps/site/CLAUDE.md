# @0x1461a0.cc/site

基于 **Astro 5** 构建的个人博客，部署在 **Vercel**。静态生成，支持暗色模式、代码块增强和 View Transition API 页面过渡。站点语言为中文 (zh-CN)。

## 命令

- **开发服务器：** `pnpm dev`（监听 localhost:4321）
- **构建：** `pnpm build`（`prebuild` 会从远程仓库克隆内容，需要 `$CONTENT_REPO_URL`）
- **预览：** `pnpm preview`
- **Astro CLI：** `pnpm astro`

## 技术栈

Astro 5 + TypeScript (strict) + React 19 + Tailwind CSS 4 + MDX

## 架构

**内容系统：** 博客文章为 `content/` 下的 Markdown 文件。生产环境中 `prebuild` 从外部 git 仓库克隆内容，本地可能已存在内容文件。使用 Astro Content Collections（glob loader），配置在 `src/content.config.ts`。Frontmatter 字段：`title`（string）、`description`（可选 string）、`created`（date）、`updated`（date）。

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

## 约定

- 所有组件为 Astro 组件（`.astro`）；React 用于交互式 island
