---
title: 0xmd GUI - 需求分析
description: 0xmd CMS 可视化客户端的需求分析文档，包含功能清单、交互形态定义与操作频率分类。
---

# 0xmd GUI - 需求分析

## 1. 项目背景

0xmd 是一个 local-first 的 Markdown 内容管理系统，当前仅有 CLI 交互方式（`@0x1461a0/0xmd-cli`）。CLI 操作流程较长（scan → diff → validate → publish），日常使用不够直观。需要实现一个 macOS 状态栏常驻的可视化客户端，提升操作效率。

### 当前实现范围

当前原型已跑通与 CLI 相同的主链路：inspect（scan + diff + validate）、外置元数据编辑、发布确认、Git publish、打开本地 Markdown，以及 watcher 驱动的统一 workspace snapshot 刷新。

对于尚未迁移的旧内容，可在全局配置中使用 `frontmatter.policy: preserve`；GUI 与 CLI 会共同遵循该策略。

以下能力仍是后续规划，不应视为当前已经实现：设置/初始化向导、搜索与筛选、发布历史、通知、开机启动、全局快捷键和动态图标。本文后续功能清单同时包含已实现 MVP 与未来目标。

## 2. 核心交互形态

**三层渐进式交互：**

| 层级 | 形态 | 定位 |
|------|------|------|
| L0 | 状态栏图标 | 常驻指示器，图标颜色反映内容仓库状态 |
| L1 | Popover 面板 | 从托盘图标弹出的轻量面板，状态摘要 + 高频操作入口 |
| L2 | 独立窗口 | 内容列表、元数据编辑、设置等复杂功能 |

## 3. 功能清单

| 范围 | 状态 |
|------|------|
| Tray + Popover、inspect、pending/validation 状态 | 已实现 |
| Dashboard 文章列表、外置元数据编辑、打开 Markdown | 已实现 |
| diff 摘要、发布确认、commit/push、watcher 自动刷新 | 已实现 |
| 设置、初始化向导、搜索/筛选、通知、历史、快捷键 | 规划中 |

### 3.1 状态栏图标（L0 - 常驻）

| 功能 | 说明 |
|------|------|
| 状态指示 | 图标颜色实时反映仓库状态 |
| 状态语义 | 绿色=已同步，黄色=有未发布变更，红色=校验错误或配置缺失，动画=操作进行中 |

### 3.2 Popover 面板（L1 - 左键点击图标弹出）

左键点击托盘图标时，从图标正下方弹出一个自定义 Popover 面板（frameless BrowserWindow），由 React 渲染。点击面板外部自动收起。不使用原生系统菜单。

| 功能 | CLI 对应 | 说明 |
|------|----------|------|
| 状态摘要 | `status` | 显示文章数量、pending 数量 |
| 扫描内容 | `scan` | 一键触发，扫描 contentDir |
| 查看变更 | `diff` | 展示 added/updated/removed 摘要，支持展开详情 |
| 一键发布 | `publish` | 触发发布流程，带确认弹窗 |
| 内容列表入口 | - | 打开内容管理窗口 |
| 设置入口 | - | 打开设置窗口 |
| 退出 | - | 退出应用 |

### 3.3 独立窗口（L2 - 面板项触发打开）

#### 内容列表窗口

| 功能 | 说明 |
|------|------|
| 文章列表 | 表格展示所有文章（title、slug、tags、status） |
| 搜索 | 按标题/slug 模糊搜索 |
| 标签筛选 | 按 tag 过滤文章列表 |
| 状态筛选 | synced / pending / modified |
| 元数据编辑 | 选中文章后展示表单，可编辑 title、slug、tags、description |
| 打开编辑器 | 用系统默认编辑器打开 Markdown 文件 |

#### 设置窗口

| 功能 | CLI 对应 | 说明 |
|------|----------|------|
| 内容目录配置 | `init` (contentDir) | 路径选择器 |
| 文件模式配置 | `init` (patterns) | glob 模式编辑 |
| Git 远程配置 | `init` (git remote/branch) | remote URL、branch |
| 文件监听开关 | - | 是否自动监听 contentDir 变更 |
| 系统通知开关 | - | 发布成功/失败时是否发送通知 |
| 开机启动 | - | Launch at login |

#### 初始化向导（首次使用）

| 功能 | 说明 |
|------|------|
| 引导式配置 | 如果检测不到 `~/.0xmd/0xmd.config.yml`，弹出向导引导用户完成初始化 |

### 3.4 GUI 新增能力（CLI 不具备）

| 能力 | 说明 |
|------|------|
| 实时状态指示 | 图标颜色即时反映仓库状态 |
| 文件监听 | 监听 contentDir 变更，自动 scan，实时刷新状态 |
| 元数据可视化编辑 | 表单 UI 替代手动编辑 metadata.json |
| 发布历史 | 展示最近的 publish 记录（commit hash、时间、变更摘要） |
| 系统通知 | 发布成功/失败时推送 macOS 通知 |
| 全局快捷键 | 快捷键触发常用操作 |

## 4. 操作频率分类

| 频率 | 操作 | 交互层级 |
|------|------|----------|
| 高频 | 查看状态、scan、diff、publish | Popover 面板（L1） |
| 中频 | 浏览文章列表、编辑元数据、validate | 独立窗口（L2） |
| 低频 | 初始化、修改配置、reset-manifest、rebuild-index | 独立窗口（L2） |
