---
title: 0xmd GUI - UI 设计
description: 0xmd CMS 可视化客户端的 UI 设计文档，包含设计原则、状态栏图标、Popover 面板、各窗口界面原型与通知机制。
---

# 0xmd GUI - UI 设计

## 1. 设计原则

- **渐进式展开** — 状态栏 → Popover 面板 → 窗口，信息密度逐级递增
- **状态先行** — 图标颜色即时反映内容仓库状态，不需要点开就能感知
- **最少点击** — 高频操作（scan、diff、publish）在 Popover 面板第一层直接可达
- **安全操作** — publish 和 reset-manifest 等不可逆操作必须有确认步骤

### 当前原型状态

当前已实现 Popover 状态摘要/inspect/publish、Dashboard diff 与 validation 摘要、元数据编辑、打开 Markdown 和发布确认。本文中的 View Changes 子视图、Settings、Init Wizard、通知、全局快捷键与动态图标仍是后续设计。

## 2. 状态栏图标

### 图标状态

| 状态 | 视觉表现 | 触发条件 |
|------|----------|----------|
| idle (绿色) | 稳定绿色图标 | manifest 与当前 hash 完全一致 |
| pending (黄色) | 稳定黄色图标 | diff 检测到 added/updated/removed |
| error (红色) | 稳定红色图标 | validate 失败或 config 未找到 |
| syncing (动画) | 旋转/脉冲动画 | scan 或 publish 进行中 |

## 3. Popover 面板

左键点击托盘图标时，从图标正下方弹出一个自定义面板。技术上是一个 frameless、transparent、alwaysOnTop 的 BrowserWindow，内容由 React 渲染。点击面板外部（blur）自动收起。不使用原生系统菜单。

### 实现方式

- **窗口类型** — `frameless` + `transparent` + `alwaysOnTop` + `skipTaskbar` 的 BrowserWindow
- **定位** — 通过 `tray.getBounds()` 获取托盘图标位置，将面板锚定在图标正下方居中
- **显示/隐藏** — 左键点击托盘图标 toggle 面板；面板 `blur` 事件自动隐藏
- **无 Dock 图标** — 面板窗口不出现在 Dock 和 App Switcher 中

### 面板内容

```
┌──────────────────────────────┐
│  0xmd                   v0.2 │
│ ─────────────────────────── │
│  ● 3 posts · 1 pending      │  ← 状态摘要
│ ─────────────────────────── │
│  ↻ Scan Now          ⌘⇧S   │  ← 高频操作
│  ⎘ View Changes       ⌘⇧D   │
│  ▲ Publish...         ⌘⇧P   │
│ ─────────────────────────── │
│  Content List...             │  ← 打开独立窗口
│  Settings...                 │
│ ─────────────────────────── │
│  Quit                        │
└──────────────────────────────┘
```

### 面板项行为

| 菜单项 | 行为 |
|--------|------|
| 状态摘要 | 不可点击，纯展示 |
| Scan Now | 点击触发 scan，状态临时变为 "Scanning..." |
| View Changes | 面板内切换到变更详情子视图 |
| Publish... | 弹出确认对话框，确认后执行发布 |
| Content List... | 打开内容管理窗口（独立 BrowserWindow），同时收起面板 |
| Settings... | 打开设置窗口（独立 BrowserWindow），同时收起面板 |
| Quit | 退出应用 |

## 4. View Changes 子视图

Popover 面板内的子视图，点击 "View Changes" 后面板内容切换到此视图，顶部有返回按钮。

```
┌─────────────────────────────────────┐
│  Changes                     ← Back │
│ ──────────────────────────────────  │
│  Added (1)                          │
│    + new-post.md                    │
│  Updated (2)                        │
│    ~ hello-world.md                 │
│    ~ another-post.md                │
│  Removed (0)                        │
│ ──────────────────────────────────  │
│  [Validate]  [Publish All]          │
└─────────────────────────────────────┘
```

## 5. 内容列表窗口

```
┌──────────────────────────────────────────────────────────────┐
│  0xmd · Content Manager                              ─ □ ✕  │
│ ─────────────────────────────────────────────────────────── │
│  Search...                           Filter: [All Tags ▾]   │
│ ─────────────────────────────────────────────────────────── │
│  Title              Slug              Tags       Status      │
│ ─────────────────────────────────────────────────────────── │
│  Hello World        hello-world       [go]       ● synced   │
│  新文章             xin-wen-zhang     [life]     ○ pending  │
│  Another Post       another-post      [dev]      ◐ modified │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│  ── Detail ────────────────────────────────────────────────  │
│  Title:       [Hello World          ]                        │
│  Slug:        [hello-world          ]                        │
│  Tags:        [go] [×]  [+Add]                               │
│  Description: [                     ]                        │
│  Created:     2025-01-08T14:20:00Z                           │
│  Updated:     2025-01-08T14:20:00Z                           │
│                           [Save Metadata]  [Open in Editor]  │
└──────────────────────────────────────────────────────────────┘
```

### 布局说明

- **上半部分** — 文章列表表格，支持排序（按日期、标题）、搜索、标签筛选
- **下半部分** — 选中文章的元数据编辑表单
- **状态标记** — ● synced（绿）、○ pending（黄）、◐ modified（蓝）
- **操作按钮** — Save Metadata 保存元数据修改，Open in Editor 调用系统默认编辑器

## 6. 设置窗口

```
┌──────────────────────────────────────────────────┐
│  0xmd · Settings                          ─ □ ✕  │
│ ──────────────────────────────────────────────── │
│  General                                         │
│    Content Directory: [/path/to/content   ] [📁] │
│    File Patterns:     [**/*.md            ]      │
│                                                  │
│  Git                                             │
│    Remote:  [git@github.com:xxx/repo.git  ]      │
│    Branch:  [main                         ]      │
│                                                  │
│  Behavior                                        │
│    [ ] Watch for file changes                    │
│    [ ] Show notifications                        │
│    Launch at login: [Off ▾]                      │
│    Global shortcut: [⌘⇧O  ]                     │
│                                                  │
│                          [Cancel]  [Save]        │
└──────────────────────────────────────────────────┘
```

## 7. 发布确认对话框

```
┌────────────────────────────────────────┐
│  Publish Changes?                      │
│ ────────────────────────────────────── │
│  This will push to remote:             │
│                                        │
│    + 1 added                           │
│    ~ 2 updated                         │
│    - 0 removed                         │
│                                        │
│             [Cancel]  [Publish]        │
└────────────────────────────────────────┘
```

## 8. 初始化向导（首次使用）

首次启动检测不到配置文件时弹出，分步引导：

- Step 1: 选择 Content Directory（文件选择器）
- Step 2: 配置 Git Remote 和 Branch
- Step 3: 设置 File Patterns（默认 `**/*.md`）
- Step 4: 确认并创建配置

## 9. 通知

| 事件 | 通知内容 |
|------|----------|
| 发布成功 | "Published 3 post(s) · abc1234" |
| 发布失败 | "Publish failed: <error message>" |
| 文件变更检测 | "2 file(s) changed in content directory"（可选，默认关闭） |
| 校验错误 | "Validation failed: 2 error(s) found" |
