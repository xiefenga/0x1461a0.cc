---
title: 0xmd GUI - 技术选型
description: 0xmd CMS 可视化客户端的技术选型文档，包含 Electron、React、shadcn/ui 等核心依赖的选型理由与对比分析。
---

# 0xmd GUI - 技术选型

## 1. 选型结果

| 层 | 技术 | 版本 | 说明 |
|----|------|------|------|
| 桌面框架 | Electron | latest | 主进程直接调用 cms-core |
| 构建工具 | electron-vite | latest | 同时处理 main/preload/renderer |
| 打包分发 | electron-builder | latest | macOS DMG/App 打包 |
| 前端框架 | React | 19 | 渲染进程 UI |
| 组件库 | shadcn/ui | latest | 基于 Radix，代码拷贝到项目，完全可控 |
| 样式 | Tailwind CSS | v4 | Utility-first CSS |
| 文件监听 | chokidar | latest | 主进程内监听 contentDir |
| CMS 核心 | @0x1461a0/0xmd-core | workspace | pnpm workspace 直接引用 |

## 2. 选型理由

### 2.1 Electron vs Tauri

| 维度 | Electron | Tauri |
|------|----------|-------|
| 与 cms-core 集成 | 主进程直接 import，零胶水 | 需要 Node sidecar + JSON-RPC 协议层 |
| 开发语言 | 纯 TypeScript | Rust + TypeScript |
| 架构复杂度 | 低（单进程模型） | 高（Rust 后端 + sidecar + IPC） |
| 包体积 | ~150MB+ | ~3-8MB |
| 系统资源占用 | 较高 | 低 |
| 开发效率 | 高 | 中 |

**选择 Electron 的原因：**

- cms-core 是纯 Node.js 包，Electron 主进程直接 import 使用，无需任何适配
- 不需要维护额外的 sidecar 进程和通信协议
- 纯 TypeScript 全栈，降低开发门槛
- 后续熟悉 Rust 后可迁移到 Tauri

### 2.2 React

- 生态成熟，组件库选择丰富
- shadcn/ui 原生支持 React
- 开发者熟悉度高

### 2.3 shadcn/ui

- 代码拷贝到项目，不是 npm 黑盒依赖，完全可控
- 基于 Radix 无障碍原语，组件质量高
- Tailwind CSS 天然匹配
- 提供 Dialog、Table、Form、Dropdown Menu、Toast 等本项目所需的全部组件
- 后续可随意定制修改

### 2.4 electron-vite

- 一套配置同时处理 main process、preload script、renderer process
- 基于 Vite，开发时 HMR 快
- TypeScript 原生支持

## 3. 后续迁移 Tauri 的预留

前端 UI 层（React 组件、Tailwind 样式）可以完整复用。迁移时只需要：

1. 将 Electron main process 的 IPC handler 逻辑改为 Tauri Rust command 或 Node sidecar
2. 将 renderer 中的 `window.api.xxx()` 调用改为 Tauri `invoke()`
3. 前端组件、样式、状态管理代码零改动

关键：将主进程业务逻辑集中在 `ipc.ts` 一个模块，renderer 通过 preload 暴露的 API 调用，保持清晰边界。
