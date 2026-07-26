# CLAUDE.md — @0x1461a0.cc/0xmd-gui

0xmd CMS 的 macOS 状态栏 Electron 桌面客户端。

## 包信息

- 包名：`@0x1461a0.cc/0xmd-gui`
- 框架：Electron + React 19 + shadcn/ui
- 构建：electron-vite
- 依赖：`@0x1461a0/0xmd-core`（workspace:*）

## 命令

- `pnpm dev` — 启动开发模式（electron-vite dev）
- `pnpm build` — 构建生产版本（electron-vite build）
- `pnpm preview` — 预览生产构建
- 从 monorepo 根目录运行：`pnpm --filter @0x1461a0.cc/0xmd-gui <script>`

## 目录结构

```
src/
  main/
    index.ts              # Electron 入口，app 生命周期、dock.hide()、单实例锁
    tray.ts               # TrayManager — 托盘图标，左键 toggle Popover 面板
    windows.ts            # WindowManager — Popover 面板 + Dashboard 独立窗口
    ipc.ts                # IPC handlers（cms:inspect、cms:publish、metadata 等）
    watcher.ts            # chokidar 文件监听，防抖广播到所有窗口
    cms-bridge.ts         # 封装 cms-core 调用（loadConfig → CmsService 单例 + IPC DTO）
  preload/
    index.ts              # contextBridge 暴露 cmsApi
    index.d.ts            # window.cmsApi 类型声明
  renderer/
    index.html            # HTML 入口
    src/
      main.tsx            # React 入口，根据 ?view= 设置 popover 样式
      app.tsx             # 根组件，按 ?view= 路由到 Popover 或 Dashboard
      globals.css         # Tailwind CSS v4 + shadcn 主题变量
      lib/
        utils.ts          # cn() 工具函数
      hooks/
        use-cms.ts        # workspace snapshot / publish / metadata React hook
      components/
        ui/               # shadcn/ui 组件
        popover-panel.tsx # Popover 面板（状态摘要 + Scan + Open Dashboard + Quit）
        dashboard.tsx     # Dashboard 主面板（文章列表卡片）
resources/
  iconTemplate.png        # macOS 托盘图标（22x22）
  iconTemplate@2x.png     # Retina 托盘图标（44x44）
```

## 架构

- **Main Process**：通过 cms-core 的 `CmsService` 复用与 CLI 相同的应用流程
- **Preload**：contextBridge 暴露安全的 cmsApi 接口
- **Renderer**：React + shadcn/ui，通过 window.cmsApi 与 main process 通信
- **Tray**：macOS 状态栏常驻，Template 图标格式
- **Popover 面板**：左键点击托盘图标弹出，frameless + transparent + alwaysOnTop BrowserWindow，锚定于图标下方，blur 自动隐藏
- **Dashboard 窗口**：从 Popover 面板中点击 "Open Dashboard" 打开的独立窗口

## 窗口路由

renderer 共用同一套代码，通过 URL query param `?view=` 区分视图：
- `?view=popover` — Popover 面板
- `?view=dashboard` — Dashboard 独立窗口

## IPC 通道

- `cms:inspect` — scan + diff + validate，返回统一 workspace snapshot（invoke）
- `cms:publish` — validate + diff + Git publish + manifest/index（invoke）
- `cms:update-metadata` — 更新外置元数据并返回新 snapshot（invoke）
- `cms:rebuild-index` / `cms:reset-manifest` — 维护本地状态文件（invoke）
- `cms:open-content-file` — 使用系统默认编辑器打开 Markdown（invoke）
- `cms:get-content-dir` — 获取内容目录路径（invoke）
- `cms:open-dashboard` — 打开 Dashboard 窗口（send，同时收起 Popover）
- `cms:quit` — 退出应用（send）
- `cms:workspace-changed` — 统一 workspace snapshot 推送（main → 所有 renderer 窗口）
- `cms:workspace-error` — watcher/inspect 错误推送（main → 所有 renderer 窗口）
