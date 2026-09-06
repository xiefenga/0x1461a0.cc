# 0x1461A0 Design System

本站已迁移到 Astro 7 + Panda CSS。设计方向保持暖白纸面、铜棕强调色、衬线标题与清晰的技术正文。

## 唯一实现来源

- [`panda.config.ts`](../../apps/site/panda.config.ts)：语义颜色、明暗主题、字体、字号、阅读宽度与 textStyles。
- [`ui.ts`](../../apps/site/src/styles/ui.ts)：公共容器、图标按钮 recipe、文章行。
- [`global.css`](../../apps/site/src/styles/global.css)：Panda layers、基础可访问性与 Markdown Prose；通过生成的 CSS 变量引用配置，无第二份颜色定义。
- 页面直接使用 Panda 的 `css()`，生成的 `styled-system/` 不提交，在安装时自动 codegen。

旧的独立视觉原型已经改为打开实际站点，避免样例与产品维护两套样式。原 `specs/design-spec.md` 与 `design-mockup.html` 是历史设计参考，不是当前实现契约。

## 规则

正文 16px / 1.85，辅助信息 13px / 1.6，页面标题 28–36px / 1.4。Header 在所有页面独立使用全视口宽度、左右 32px，参考 antfu.me；main、Footer 共用 `container`，最大 964px（桌面正文净宽 820px）；两侧内边距手机 16px、桌面 48px。main 统一额外内缩手机 8px、sm 以上 24px，首页与详情不再有宽度分支。TOC 在 1360px 以上放在正文外侧，较窄屏幕使用浮动入口，不改变正文宽度。长标题换行，代码/表格仅在局部横向滚动。

所有文字颜色使用 ink / secondary / muted / accent，表面使用 paper / surface。主题在根元素切换 `.dark`，不在组件逐处复制主题色。字体通过 Fontsource 本地打包；中文使用系统字体回退。

控件至少 44px 可操作区域；键盘焦点始终可见；复制按钮不依赖 hover 显示。尊重 reduced motion；复制成功只在 clipboard 完成后反馈。导航使用 Astro ClientRouter，交互通过 page-load 或事件委托适配页面切换。

## 运行与验证

在仓库根目录执行：

```sh
pnpm --dir apps/site dev
pnpm --dir apps/site typecheck
pnpm --dir apps/site test
CONTENT_REPO_URL= pnpm --dir apps/site build
python3 specs/design-system/check.py
```

本地预览使用实际首页和文章页（默认端口 4321）。最后一条构建命令显式使用本地内容，正常发布仍可通过原 sync-content 流程拉取 Git 内容。

源码比较见 [reference-review.md](./reference-review.md)。[architecture.md](./architecture.md) 保留选型依据；其中“待实施”内容描述评审时状态，本页与实际代码为当前迁移状态。ISR 尚未启用，本轮维持静态输出及原内容发布契约。

## 文章目录（2026-09-06）

参考 [Innei 的文章页](https://innei.in/posts/tech/css-to-stylex-migration) 实际 DOM、计算样式和交互，并阅读本地 Shiro 的 TocAside / TocTree / TocItem / TocAutoScroll / TocFAB。线上站点与公开源码存在差异，以下为本站独立实现，不代表参考站的内部实现。

- 桌面目录宽 200px，与正文间距 24px，与正文起点对齐，滚动后吸附在距顶部 120px；条目 14px / 21px、行高 24.5px，按标题层级缩进。
- 单一渐变指示条随当前章节移动，位置与高度过渡 400ms，条目颜色与显隐过渡 300ms。点击平滑滚动，标题停在距顶部约 100px。
- 阅读时收起为曲线、章节圆点、当前标题和进度；悬停或键盘聚焦展开。本站采用 1400ms 空闲延时，曲线由原生 SVG 绘制。
- 小于 1360px 使用右侧悬浮按钮与底部原生 dialog；支持关闭按钮、遮罩关闭和标题栏下滑关闭。打开时锁定背景滚动，关闭恢复焦点，选择章节将焦点交给标题。
- 沿用本站 Panda 语义色；手机条目保持至少 44px 点击区域。尊重 reduced motion，Astro 页面切换时清理监听与临时节点。

浏览器验证覆盖正文对齐、章节定位、进度和收起展开、手机面板开关与焦点、减少动态效果、断点切换、ClientRouter 往返及无横向溢出。动效采用 CSS / Web Animations API，不额外引入 Motion 或 React island。

## 迁移验证（2026-09-05）

Astro 7.3.1 / Panda CSS 1.12.1。锁文件安装及 codegen 成功；Astro check 为 0 errors / 0 warnings；4 项测试通过（内容 fixture 增加 MDX、代码增强、Shiki、链接转义、表格和生成 CSS 校验）；静态构建完成 13 个页面及 RSS/sitemap；CMS Vite 6 构建通过。

浏览器检查实际首页与文章页：375/768/1440px 无横向溢出；中文长标题换行；浅深色背景与代码主题正确；ClientRouter 往返后主题保留，复制事件不重复；用 Clipboard stub 验证成功和拒绝反馈；reduced motion 下 transition 为 0s；强制 focus-visible 状态后焦点为 2px solid。语义文字色与两种表面共 16 组对比度检查通过（最低 4.54:1）。未进行真实辅助技术或线上部署验收。
