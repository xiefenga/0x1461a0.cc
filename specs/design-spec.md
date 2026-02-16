# 0x1461A0's Blog 设计规范

> 基于 `design-mockup.html` 提取的完整设计要素，供开发实现参考。

---

## 1. 页面结构

共 3 个页面：

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 / 关于 | `/` | 个人介绍、社交链接 |
| 博客列表 | `/blog` | 按年份分组的文章列表 |
| 文章详情 | `/post/:slug` | 文章正文、浮动目录 |

---

## 2. 颜色体系

所有颜色通过 CSS 变量管理，支持 Light / Dark 双主题。

### 2.1 Light 主题（默认）

| 变量 | 色值 | 用途 |
|------|------|------|
| `--bg-primary` | `#faf8f5` | 页面背景 |
| `--bg-secondary` | `#f3efe9` | 悬停背景、次级背景 |
| `--bg-card` | `#ffffff` | 卡片背景 |
| `--bg-code` | `#f6f2ec` | 行内代码背景 |
| `--bg-code-block` | `#2c2d30` | 代码块背景 |
| `--text-primary` | `#1a1a1a` | 主文本 |
| `--text-secondary` | `#6b6560` | 次级文本（正文、简介） |
| `--text-tertiary` | `#a09890` | 辅助文本（日期、版权） |
| `--text-code` | `#e8e4df` | 代码块文本 |
| `--accent` | `#c87941` | 强调色（链接、标签高亮、装饰） |
| `--accent-soft` | `rgba(200, 121, 65, 0.10)` | 强调色浅底 |
| `--accent-hover` | `#b06830` | 强调色悬停态 |
| `--border` | `#e8e2da` | 边框 |
| `--border-light` | `#f0ebe4` | 浅边框（页脚分隔线） |
| `--tag-bg` | `#eee8df` | 标签背景 |
| `--tag-text` | `#7a7068` | 标签文字 |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)` | 小阴影 |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.06)` | 中等阴影 |
| `--year-color` | `#e8e2da` | 年份标签（装饰性） |
| `--scrollbar-thumb` | `#d0c8be` | 滚动条 |
| `--scrollbar-track` | `transparent` | 滚动条轨道 |
| `--nav-active` | `#1a1a1a` | 导航激活态 |
| `--nav-inactive` | `#a09890` | 导航默认态 |

#### 代码高亮（Light）

| 变量 | 色值 | 用途 |
|------|------|------|
| `--code-keyword` | `#c87941` | 关键字 |
| `--code-string` | `#6a8f5e` | 字符串 |
| `--code-comment` | `#8a8580` | 注释 |
| `--code-func` | `#5a7fb5` | 函数名 |
| `--code-num` | `#c87941` | 数字 |

### 2.2 Dark 主题

| 变量 | 色值 | 用途 |
|------|------|------|
| `--bg-primary` | `#1e1f21` | 页面背景 |
| `--bg-secondary` | `#262729` | 悬停背景 |
| `--bg-card` | `#2a2b2e` | 卡片背景 |
| `--bg-code` | `#323336` | 行内代码背景 |
| `--bg-code-block` | `#18191b` | 代码块背景 |
| `--text-primary` | `#e8e4df` | 主文本 |
| `--text-secondary` | `#9a958e` | 次级文本 |
| `--text-tertiary` | `#5e5a55` | 辅助文本 |
| `--text-code` | `#c8c4bf` | 代码块文本 |
| `--accent` | `#d4915a` | 强调色 |
| `--accent-soft` | `rgba(212, 145, 90, 0.12)` | 强调色浅底 |
| `--accent-hover` | `#e0a06a` | 强调色悬停态 |
| `--border` | `#353638` | 边框 |
| `--border-light` | `#2f3032` | 浅边框 |
| `--tag-bg` | `#333436` | 标签背景 |
| `--tag-text` | `#908880` | 标签文字 |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.2)` | 小阴影 |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.3)` | 中等阴影 |
| `--year-color` | `#2e2f31` | 年份标签 |
| `--scrollbar-thumb` | `#454648` | 滚动条 |
| `--nav-active` | `#e8e4df` | 导航激活态 |
| `--nav-inactive` | `#5e5a55` | 导航默认态 |

#### 代码高亮（Dark）

| 变量 | 色值 | 用途 |
|------|------|------|
| `--code-keyword` | `#d4915a` | 关键字 |
| `--code-string` | `#8ab87a` | 字符串 |
| `--code-comment` | `#6a6560` | 注释 |
| `--code-func` | `#7a9fd5` | 函数名 |
| `--code-num` | `#d4915a` | 数字 |

---

## 3. 字体体系

### 3.1 字体族

| 用途 | 字体族 | Fallback |
|------|--------|----------|
| 正文 | Instrument Sans | -apple-system, PingFang SC, Microsoft YaHei, sans-serif |
| 标题 | 通过 `--font-heading` 变量控制，默认 Newsreader | Noto Serif SC, serif |
| 代码 | JetBrains Mono | monospace |

### 3.2 可选标题字体

以下字体均已加载，通过 `--font-heading` CSS 变量切换：

| 字体 | 风格 | 完整值 |
|------|------|--------|
| Newsreader（默认） | Transitional Serif | `'Newsreader', 'Noto Serif SC', serif` |
| Lora | Calligraphic Serif | `'Lora', 'Noto Serif SC', serif` |
| Playfair Display | High Contrast Serif | `'Playfair Display', 'Noto Serif SC', serif` |
| Libre Baskerville | Classic Serif | `'Libre Baskerville', 'Noto Serif SC', serif` |
| DM Serif Display | Modern Sharp Serif | `'DM Serif Display', 'Noto Serif SC', serif` |
| Fraunces | Soft Wonky Serif | `'Fraunces', 'Noto Serif SC', serif` |
| Source Serif 4 | Clean Neutral Serif | `'Source Serif 4', 'Noto Serif SC', serif` |
| Inter | Sans-serif | `'Inter', 'Noto Sans SC', sans-serif` |

### 3.3 字体大小总表

最小字体 12px，所有场景均不低于此值。

| 元素 | 字号 | 字重 | 行高 | 字距 | 字体族 |
|------|------|------|------|------|--------|
| **首页标题** | 36px (移动端 28px) | 400 | 1.35 | -0.5px | --font-heading |
| **文章详情标题** | 36px (移动端 28px) | 500 | 1.35 | -0.5px | --font-heading |
| **文章 h2** | 24px | 500 | — | -0.3px | --font-heading |
| **文章 h3** | 19px | 500 | — | — | --font-heading |
| **年份标签** | 48px | 600 | 1 | -3px (移动端 -2px) | --font-heading |
| **正文段落** | 16px | — | 1.85 | — | 正文字体 |
| **列表项** | 16px | — | 1.85 | — | 正文字体 |
| **首页简介** | 16px | — | 1.9 | — | 正文字体 |
| **文章列表标题** | 16px | 500 | 1.5 | — | 正文字体 |
| **导航链接** | 14px | 500 | — | — | 正文字体 |
| **首页社交按钮** | 14px | — | — | — | 正文字体 |
| **文章 meta** | 14px | — | — | — | 正文字体 |
| **行内 code** | 14px | — | — | — | JetBrains Mono |
| **代码块内容** | 13.5px | — | 1.7 | — | JetBrains Mono |
| **文章日期** | 13px | — | — | — | JetBrains Mono |
| **TOC 链接** | 13px | — | 1.4 | — | 正文字体 |
| **页脚版权** | 13px | — | — | — | 正文字体 |
| **标签** | 12px | 500 | — | 0.3px | 正文字体 |
| **代码块语言标签** | 12px | — | — | 1px | JetBrains Mono |
| **Font Switcher 标题** | 12px | — | — | 2px | JetBrains Mono |
| **Font Switcher 风格描述** | 12px | — | — | — | 正文字体 |
| **Mockup 标签** | 12px | — | — | 3px | JetBrains Mono |

---

## 4. 布局

### 4.1 内容容器

- 最大宽度：**740px**
- 居中对齐，左右 padding **24px**

### 4.2 页面间距

| 区域 | 间距 |
|------|------|
| Header 顶部 padding | 36px |
| 首页 hero 区域 | padding 80px 0 40px |
| 博客列表页 Header→内容 | 100px |
| 文章详情 Header→内容 | padding-top 48px, padding-bottom 36px |
| 文章正文底部 | padding-bottom 64px |
| 页脚上方间距 | margin-top 48px |
| 页脚内部 padding | 28px 0 36px |

### 4.3 响应式断点

- **640px**：移动端适配
  - 首页标题：36px → 28px
  - 文章标题：36px → 28px
  - 文章列表项：横向 → 纵向排列
  - 页脚：横向 → 纵向居中
  - Header 导航：隐藏
  - 社交链接 gap：10px → 8px

- **1160px**：浮动目录显示
  - TOC 固定在右侧，`right: calc((100vw - 740px) / 2 - 180px)`，宽度 160px

---

## 5. 组件规范

### 5.1 Header

- Logo：SVG 手写动画 "0x1461A0"，高度 30px
- 导航：仅 "Blog" 链接（点击 Logo 回首页）
- 右侧按钮：RSS + 主题切换，尺寸 34x34px，圆角 8px
- 导航链接 padding：6px 12px，圆角 6px

### 5.2 SVG 手写 Logo 动画

- ViewBox：`0 0 248 48`
- 笔画：`stroke-width: 2.3`，`stroke-linecap: round`，`stroke-linejoin: round`
- 动画：`stroke-dasharray: 300` + `stroke-dashoffset: 300` → 0
- 时长：每段 0.5s，`cubic-bezier(0.25, 0.1, 0.25, 1)`
- 延迟序列（11 段路径）：

| 字符 | 路径数 | 延迟 |
|------|--------|------|
| 0 | 1 | 0s |
| x | 2 | 0.13s, 0.22s |
| 1 | 1 | 0.31s |
| 4 | 2 | 0.43s, 0.54s |
| 6 | 1 | 0.65s |
| 1 | 1 | 0.82s |
| A | 2 | 0.93s, 1.04s |
| 0 | 1 | 1.14s |

### 5.3 首页 Hero

- 标题："你好，我是 *0x1461A0*"（"0x1461A0" 使用 accent 色斜体）
- 简介："AI Agent 全栈开发工程师，TypeScript / Node.js / Python。"
- 社交链接按钮：GitHub / Twitter / Email
  - 尺寸：padding 7px 14px，圆角 8px
  - 边框：1px solid var(--border)
  - 悬停：边框变 accent，文字变 accent，背景 accent-soft
  - 图标尺寸：15x15px

### 5.4 博客列表

- 按年份分组，年份标签 48px / 600 weight，装饰性淡色
- 列表项间距：gap 2px
- 列表项 padding：12px 16px，圆角 10px
- 悬停效果：
  - 背景变为 `--bg-secondary`
  - 左侧出现 3px 宽、24px 高的 accent 色竖条（动画 0.25s）
- 标签：12px，padding 2px 8px，圆角 4px
- 日期：JetBrains Mono 13px

### 5.5 文章详情

- 标题：36px / 500 weight
- Meta 栏：日期 + 阅读时长 + 标签，14px，用 3px 圆点分隔（opacity 0.4）
- 正文段落：16px / 1.85 行高
- 引用块：左边框 3px accent 色，padding-left 20px，斜体
- 行内代码：JetBrains Mono 14px，背景 `--bg-code`，padding 2px 7px，圆角 4px
- 代码块：
  - 圆角 12px，背景 `--bg-code-block`，阴影 `--shadow-md`
  - Header：语言标签 + 复制按钮
  - 复制按钮：28x28px，圆角 6px
  - 代码内容：padding 20px，JetBrains Mono 13.5px / 1.7 行高
- 链接：accent 色，底部 1px dashed 下划线，悬停 opacity 0.7

### 5.6 浮动目录（TOC）

- 仅在 >= 1160px 屏幕显示
- 固定定位，右侧偏移
- 链接 13px，颜色 `--text-tertiary`，激活态 accent 色
- 子级缩进：padding-left 12px
- 无标题

### 5.7 页脚

- 上边框：1px solid `--border-light`
- 内容：版权信息 "&copy; 2022 – PRESENT 0x1461A0"
- 字号 13px，颜色 `--text-tertiary`

---

## 6. 交互与动画

| 效果 | 参数 |
|------|------|
| 主题切换（背景） | `transition: background 0.4s ease, color 0.3s ease` |
| 按钮/链接悬停 | `transition: all 0.2s` |
| 文章列表左竖条 | `transition: height 0.25s ease` |
| 代码块复制按钮悬停 | `transition: all 0.15s` |
| 首页 fade-up 入场 | `animation: fadeUp 0.5s ease both`（Y轴 12px → 0） |
| SVG Logo 手写 | `animation: handwrite 0.5s cubic-bezier(0.25,0.1,0.25,1) forwards` |
| 年份标签颜色 | `transition: color 0.3s` |

---

## 7. 滚动条

| 属性 | 值 |
|------|------|
| 宽度（WebKit） | 6px |
| 轨道 | transparent |
| 滑块 | `--scrollbar-thumb`，圆角 3px |
| Firefox | `scrollbar-width: thin` |

---

## 8. 主题切换

- 通过在 `<html>` 上切换 `.dark` class 实现
- 默认跟随系统偏好 `prefers-color-scheme`
- 所有页面的主题切换按钮保持同步
- Dark 模式变量选择器：`.dark { ... }`（对应 Tailwind 的 `@custom-variant dark`）
