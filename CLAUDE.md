# CLAUDE.md

为 Claude Code (claude.ai/code) 提供本仓库的开发指引。

## 项目概述

个人博客的 **Turborepo monorepo**，scope 为 `@0x1461a0.cc`。

## Monorepo 结构

- `apps/site/` — Astro 博客应用（`@0x1461a0.cc/site`）
- `packages/` — 共享包（目前为空，供未来使用）
- 根目录 — Turborepo 配置、pnpm workspace、共享工具

## 命令

- **启动开发服务器：** `pnpm dev`（通过 turbo 运行）
- **构建：** `pnpm build`（通过 turbo 运行）
- **预览生产构建：** `pnpm preview`
- **仅在指定应用中运行命令：** `pnpm --filter <package-name> <script>`

未配置测试套件或 linter。

## 约定

- 语义化提交信息：`feat:`、`fix:`、`chore:`
- 文件名使用 kebab-case
- 包管理器为 **pnpm**
- Monorepo scope 为 `@0x1461a0.cc`
