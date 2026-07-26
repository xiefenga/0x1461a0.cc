---
title: 0xmd GUI - 架构设计
description: 0xmd CMS 可视化客户端的架构设计文档，包含整体架构图、目录结构、进程通信、模块职责、数据流与打包方案。
---

# 0xmd GUI - 架构设计

## 1. 整体架构

```
┌───────────────────────────────────────────────────┐
│                  macOS System Tray                  │
│                (Electron Tray API)                  │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│              Electron Main Process                 │
│                                                    │
│  ┌────────────┐ ┌────────────┐ ┌───────────────┐ │
│  │ TrayManager│ │ WindowMgr  │ │ FileWatcher   │ │
│  │ 图标/Popover│ │ 窗口生命周期│ │ (chokidar)    │ │
│  └─────┬──────┘ └─────┬──────┘ └───────┬───────┘ │
│        │              │                 │          │
│  ┌─────┴──────────────┴─────────────────┴───────┐ │
│  │           @0x1461a0/0xmd-core                 │ │
│  │           CmsService (CLI/GUI 共享)             │ │
│  │           - inspect() / updateMetadata()       │ │
│  │           - publish() / rebuildIndex()         │ │
│  └───────────────────────────────────────────────┘ │
│                       │                            │
│                  IPC (ipcMain)                      │
└───────────────────────┬───────────────────────────┘
                        │ contextBridge (preload)
                        ▼
┌───────────────────────────────────────────────────┐
│          Electron Renderer (BrowserWindow)         │
│                                                    │
│  React + shadcn/ui + Tailwind CSS                  │
│  - Content List                                    │
│  - Metadata Editor                                 │
│  - Settings                                        │
│  - Init Wizard                                     │
└───────────────────────────────────────────────────┘
```

## 2. Monorepo 目录结构

```
apps/
  cms-cli/                  # CLI，与 GUI 共用 CmsService
  cms-gui/                  # 新增：Electron 桌面应用
    src/main/               #   主进程代码
      index.ts              #     Electron 入口
      tray.ts               #     系统托盘（Popover 面板、图标状态）
      windows.ts            #     窗口管理（Popover 面板 + 独立窗口的创建/销毁/定位）
      ipc.ts                #     IPC handlers（调用 cms-core，集中管理）
      watcher.ts            #     chokidar 文件监听
      cms-bridge.ts         #     CmsService 单例 + IPC DTO 映射
    src/renderer/src/       #   渲染进程
      components/           #     React 组件
        ui/                 #       shadcn/ui 组件
        dashboard.tsx       #       diff/validate + 内容与 metadata
        popover-panel.tsx   #       状态摘要 + inspect/publish
      hooks/use-cms.ts      #     workspace snapshot hook
      app.tsx               #     根组件
      main.tsx              #     渲染进程入口
    src/preload/            #   preload 脚本
      index.ts              #     contextBridge 暴露安全 API
    resources/              #   静态资源
      icons/                #     托盘图标（各状态）
    electron-builder.yml    #   打包配置
    electron.vite.config.ts #   electron-vite 配置
    tailwind.config.ts      #   Tailwind 配置
    tsconfig.json
    package.json            #   @0x1461a0.cc/0xmd-gui
packages/
  cms-core/                 # 现有核心库（零改动）
```

## 3. 进程通信设计

### 3.1 Preload 暴露的 API

```typescript
// preload/index.ts
// 通过 contextBridge 暴露给 renderer

interface CmsApi {
  inspect(): Promise<WorkspaceSnapshotDTO>
  publish(): Promise<PublishOutcomeDTO>
  updateMetadata(path: string, metadata: Partial<MetadataEntry>): Promise<WorkspaceSnapshotDTO>
  rebuildIndex(): Promise<void>
  resetManifest(): Promise<WorkspaceSnapshotDTO>
  openContentFile(path: string): Promise<void>
  onWorkspaceChanged(callback: (snapshot: WorkspaceSnapshotDTO) => void): () => void
  onWorkspaceError(callback: (message: string) => void): () => void
}
```

### 3.2 IPC Channel 命名

```
cms:inspect
cms:publish
cms:rebuild-index
cms:reset-manifest
cms:update-metadata
cms:get-content-dir
cms:open-content-file

// Events (main → renderer)
cms:workspace-changed
cms:workspace-error
```

## 4. 主进程模块职责

### 4.1 main.ts - 入口

- 创建 Electron app
- 初始化 TrayManager、WindowManager
- 加载 cms-core 配置
- 启动 FileWatcher
- 注册 IPC handlers
- 处理 app 生命周期（ready、window-all-closed、activate）
- 设置 app 为 menubar 模式（不显示 Dock 图标）

### 4.2 tray.ts - TrayManager

- 创建系统托盘图标
- 管理 Popover 面板的显示/隐藏/定位（左键点击 toggle）
- Popover 面板是 frameless + transparent + alwaysOnTop 的 BrowserWindow，内容由 React 渲染
- 通过 `tray.getBounds()` 计算面板位置，锚定在托盘图标正下方
- 面板 `blur` 事件自动隐藏
- 不使用原生系统菜单
- 管理图标状态切换（idle/pending/error/syncing）
- 注册全局快捷键

### 4.3 windows.ts - WindowManager

- 管理两类 BrowserWindow 实例：
  - **Popover 面板** — frameless 小窗口，锚定于托盘图标下方，用于 L1 层交互
  - **独立窗口** — 内容列表窗口、设置窗口等，用于 L2 层复杂交互
- 窗口创建、销毁、显示/隐藏
- Popover 定位：跟随托盘图标 bounds 居中对齐
- 独立窗口定位：屏幕居中
- 单实例控制（同一窗口不重复创建）

### 4.4 ipc.ts - IPC Handlers

- 所有 cms-core 调用集中在此模块
- 通过 `cms-bridge.ts` 维护 `CmsService` 单例
- 处理所有 `cms:*` channel 的请求
- 错误统一捕获和格式化
- **迁移 Tauri 时只需替换此模块**

### 4.5 watcher.ts - FileWatcher

- 使用 chokidar 监听 contentDir
- 文件变更时自动触发 scan
- 通过 IPC event 通知 renderer 更新 UI
- 更新托盘图标状态
- 防抖处理（避免频繁触发）

## 5. 渲染进程路由

不使用前端路由库，通过窗口区分页面：

| 窗口 | 入口路径 | 内容 |
|------|----------|------|
| Popover 面板 | `?view=popover` | 状态摘要 + 高频操作（Scan、View Changes、Publish） |
| 内容管理窗口 | `?view=content` | ContentList + MetadataEditor |
| 设置窗口 | `?view=settings` | Settings |
| 初始化向导 | `?view=init` | InitWizard |

## 6. 状态管理

使用 React 内置能力，不引入额外状态库：

- **全局状态** — React Context（AppStatus、Config）
- **组件状态** — useState/useReducer
- **服务端状态** — 自定义 hooks 封装 IPC 调用（类 SWR 模式：调用 → loading → data/error）

## 7. 数据流

```
FileWatcher (chokidar)
    │ 文件变更
    ▼
CmsService.inspect()
    │ 更新 metadata.json
    ▼
ipc.ts → IPC event "cms:workspace-changed"
    │
    ▼
Renderer (React)
    │ onStatusChange callback
    ▼
UI 更新（状态摘要、列表刷新）
同时 → TrayManager 更新图标状态
```

## 8. 打包与分发

| 配置项 | 值 |
|--------|-----|
| App ID | `cc.0x1461a0.0xmd` |
| 目标平台 | macOS (darwin) |
| 打包格式 | DMG + App |
| 架构 | Universal (x64 + arm64) |
| 签名 | 暂不签名（个人使用） |
| 自动更新 | 暂不实现 |

## 9. 对 cms-core 的影响

cms-core 新增 `CmsService` 应用层，统一 CLI 与 GUI 的 inspect、metadata update、validate/diff 和 publish 编排；`ContentManager` 继续负责底层内容状态。GUI 只做 IPC DTO 转换，不复制发布业务逻辑。
