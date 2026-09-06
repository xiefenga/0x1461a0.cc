# 参考项目源码评审

评审日期：2026-09-05。范围是视觉系统、主题组织、阅读布局及交互基础，不是全仓正确性、安全性或性能审计。以下结论来自本地源文件；线上观察仅作补充，不能保证部署版本等于 checkout。

## 本地快照

| 项目 | 本地目录 | Commit |
| --- | --- | --- |
| [Shiro](https://github.com/Innei/Shiro) | `/Users/xiefeng/codes/open_source/Shiro` | `891bb24cd59aff7c9baaf4d9a3579ca4275da3b7` |
| [Yohaku](https://github.com/Innei/Yohaku) | `/Users/xiefeng/codes/open_source/Yohaku` | `a1122b4dbfe10c3442d5ec3ecb8c9053ed7e9a57` |
| [antfu.me](https://github.com/antfu/antfu.me) | `/Users/xiefeng/codes/open_source/antfu.me` | `9e4a84921f3d1c92817bafa920bf20979a423fcc` |

Shiro 复用原有干净 checkout 并 fast-forward 更新；另外两个为 depth=1 克隆。Yohaku 公开仓库包含设计系统、iOS 与跨端内容包，完整 Web 应用私有。因此可验证设计系统的静态契约，不能声称已评审其私有 Web 运行时。此次未安装或运行三个完整应用。

## Shiro：主题和交互组件形成的系统

证据文件（相对 Shiro 根目录）：

- `apps/web/src/styles/tailwindcss.css`：Tailwind v4、DaisyUI 的 light/dark 主题、字体角色、中性灰、14px 根字号。
- `apps/web/src/styles/variables.css`：页面背景、半透明背景、边框、选区及主题过渡。
- `apps/web/src/components/ui/button/MotionButton.tsx`：基础按钮统一 hover/focus 1.02、press 0.95 的缩放反馈。
- `apps/web/src/components/ui/button/RoundedIconButton.tsx`：组合基础按钮与圆形强调色外观。

值得借鉴的是把主题变量与局部交互收敛到公共位置。明暗主题的强调色会从青色换成粉色，是其明确的视觉选择，本站不必照搬。其组件与应用生态较丰富，不适合作为当前静态博客的整体技术基础。

发现：`tailwindcss.css` 中全局 `*:focus { outline: none }`，紧随的 focus-visible 规则只有注释。仅从这套全局基础无法保证键盘焦点可见；按钮缩放也不能替代清晰焦点。本站应显式提供全局 focus-visible 基础，再允许组件增强。

## Yohaku：规则最完整，也需要核对执行状态

证据文件（相对 Yohaku 根目录）：

- `design-system/src/tokens.css`：十级中性色按表面、边界/辅助、文字分成三档，语义字号绑定行高，区分 body/serif/mono 和 Logo 字体。
- `design-system/CHEATSHEET.md`：强调色面积约束、颜色用途、字号、间距和组件决策。
- `design-system/templates/snippets/`：正文以外的组件范例。
- `design-system/showcase/src/`：颜色、排版、间距、反模式等可视化展示。

值得借鉴的是“用途规则 + token + 可见样例”，以及将边界灰与文字灰区分。注意静态 token 引用了 `--surface-paper`、`--app-font-sans` 等运行时变量，不能只复制这一文件就认为获得完整主题。私有 Web 的主题反转和动态强调色未在本次验证范围内。

发现两处明确的文档矛盾：

1. CHEATSHEET 声称通过 `--text-*: initial` 清除了 Tailwind 默认字号；tokens.css 则写明此操作延后执行。当前静态文件未执行清除。
2. CHEATSHEET 的不变量禁止 n-5 用于文字，但 Quick decisions 的 Eyebrow 使用 `text-neutral-5`。

因此不能将上游文档当作无条件正确的规范。本站保留更少的语义角色，元数据也验收可读性；不继承 10px eyebrow 和 14px 根字号。

## antfu.me：较少的全局规则，也能维持一致

证据文件（相对 antfu.me 根目录）：

- `unocss.config.ts`：背景、文字、边框 shortcuts，字体配置及按钮规则。
- `src/styles/main.css`：背景变量、暗色、滚动条、入场动效；入场受 `prefers-reduced-motion: no-preference` 保护。
- `src/styles/prose.css`：65ch 阅读宽度、1rem / 1.75 正文、完整的标题/段落/列表/代码排版。
- `src/styles/markdown.css`：Shiki 与 Markdown 专项覆盖。
- `src/components/ListPosts.vue`：按年组织、无卡片文章行、标题与日期、响应式布局。

值得借鉴的是文章发现的直接性、有限阅读宽度和共享 Prose，个性集中在个人标识与少量背景装饰。它不依赖一套庞大的独立设计系统来产生一致性。

局限：配色仍混合变量、硬编码与 opacity；列表包含巨大的低透明度年份装饰；部分排版值散布在组件及 CSS。适合作为视觉与内容结构参考，不适合作为本站“所有颜色均由 token 管理”的原样实现。

## 浏览器观察的边界

访问并查看了 antfu.me 首页、yohaku.innei.dev 展示页与 innei.in 首页的桌面截图。antfu 首页呈现窄正文与低装饰界面；Yohaku 展示页强调衬线排版与留白；innei.in 首页则有头像、活动状态和更丰富的导航。innei.in 是可能持续更新的线上实例，本报告不将它归属于当前 Shiro commit，也不将展示页等同于完整 Web 产品。没有对参考站点宣称完成跨设备测试。

## 本站取舍

| 维度 | 采用 | 调整 |
| --- | --- | --- |
| 内容结构 | antfu 的文章行、文字优先 | 维持本站现有路由，不新增参考站的产品模块 |
| 色彩 | Yohaku 的角色纪律 | 延续本站暖白与铜棕方向，用语义名代替十级灰 |
| 字体 | 明确区分标题、正文、代码 | 中文正文 16px，元数据 13px，标题 28–36px |
| 留白 | 窄阅读栏与稳定章节节奏 | 统一为 740px 容器；移动端 16px 起的边距 |
| 交互 | Shiro 的公共控件基础 | 原生 CSS 反馈、清晰焦点，阅读元素不缩放 |
| 治理 | Yohaku 的样例与契约 | token 与预览共用文件；生产接入后让预览复用生产组件 |

这不是三套皮肤相加。本站识别点是温暖纸面、铜棕链接、衬线标题与轻量技术排版，完整草案见 [README](./README.md)。

## 来源与复用

此次新增样式独立编写，未复制三站的 Logo、头像、文章或组件实现。参考仓库文件声明：Shiro 为 AGPLv3 并附 ADDITIONAL_TERMS；Yohaku 的 design-system 为 MIT，其他内容按其目录声明；antfu.me 代码为 MIT，文字与图片为 CC BY-NC-SA。未来若直接复用源代码，应保留对应来源和许可文本。
