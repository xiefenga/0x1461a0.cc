# 站点技术架构选型

2026-09-05 · 建议方案，尚未执行依赖升级或框架迁移。

## 结论

保留 Astro，目标升级到当前稳定 7.x；页面、文章与布局继续使用 Astro，简单交互使用原生脚本。未来确有复杂交互时优先 React islands，以复用 CMS 已有经验与依赖。Design system 的基础保持 CSS token 与框架无关，不为统一外观强制统一页面框架。

若目标变为强交互的在线写作产品，再评估 SvelteKit 或完整 React 应用。当前没有证据表明更换框架能解决已有的样式不协调。

## 当前代码依据

- `apps/site/package.json` 与 lockfile：Astro 5.17.2，React 19.2.4，Tailwind 4，MDX 与 Vercel integrations。
- `apps/site/astro.config.ts`：`output: static`，两个本地 Markdown 插件、Shiki 双主题。
- `apps/site/src/content.config.ts`：已经使用 `glob()` Content Layer，支持 md/mdx，frontmatter 有 schema。
- `apps/site/src`：页面和展示组件都是 `.astro`，未发现实际 React 组件或 `client:*` islands；存在主题切换与复制代码原生脚本。安装 React integration 不代表页面必然加载 React 运行时。
- `apps/site/src/lib/posts.ts`：保留 metadata slug 优先、重复 slug 报错、按时间排序的内容契约。
- `apps/site/src/__tests__/published-content.e2e.test.ts`：已有 frontmatter → HTML、首页链接、RSS 的端到端回归。
- `apps/cms-gui/package.json`：Electron + React，属于写作/发布端，与公开阅读站的交互需求不同。
- 根 package.json 声明 Node 24.13.1；声明满足目标 Astro 的 >=22.12 要求，实际本地及部署环境仍须单独核实。

## 稳定版本快照

以下是本次从 npm 官方 registry `latest` 元数据直接读取的版本，不采用搜索摘要中的 alpha/RC。

| 层 | 版本 | 官方包元数据 |
| --- | --- | --- |
| Astro | 7.3.1 | [astro](https://registry.npmjs.org/astro/latest) |
| Svelte / SvelteKit | 5.57.0 / 2.70.3 | [svelte](https://registry.npmjs.org/svelte/latest)、[kit](https://registry.npmjs.org/@sveltejs/kit/latest) |
| Solid / SolidStart | 1.9.15 / 2.0.4 | [solid-js](https://registry.npmjs.org/solid-js/latest)、[start](https://registry.npmjs.org/@solidjs/start/latest) |
| React / Next.js | 19.2.8 / 16.3.4 | [react](https://registry.npmjs.org/react/latest)、[next](https://registry.npmjs.org/next/latest) |

这些链接随发布时间变化；上表是评审时快照。对应 Astro integration 最新版本为 MDX 8.0.0、React 6.0.5、Vercel 11.0.10，升级时必须共同核对 peerDependencies。SolidStart 2 仍基于 Solid 1，不能从其版本号推断 Solid 2 已稳定。

## 方案比较

以下迁移成本和适配度是基于当前代码的判断，未经跨框架性能基准测试。

| 方案 | 对本站的收益 | 成本与适用边界 | 判断 |
| --- | --- | --- | --- |
| Astro 7 + 原生脚本 | 保留内容集合、路由、RSS、Markdown 与部署路径；静态输出符合阅读站需求 | 处理跨两代的编译、内容管线和 integration 变更 | 首选 |
| Astro + React islands | 复杂搜索、筛选等确有需要时局部激活；与 CMS 同一组件技术 | island 需控制 JS 与状态边界；当前无必要预先增加 | 按需使用 |
| Astro + Svelte 5 islands | 局部交互仍可保留 Astro 外壳，可作为 Svelte 试验边界 | 新增一种组件语法与维护栈；不直接复用 React 控件 | 有明确 Svelte 偏好时可选 |
| SvelteKit 2 + Svelte 5 | 适合连贯的应用状态、表单、交互页面；也支持静态预渲染 | 重写 `.astro` 布局、路由、内容加载与 Markdown 集成；需重验 RSS/slug/SEO | 真要重写时优先候选 |
| SolidStart 2 + Solid 1 | 细粒度响应式，适合交互密集界面；JSX 可读但非 React 兼容 | 当前公开站缺少能体现响应式收益的工作负载；增加新的路由、部署及组件体系 | 当前不优先 |
| React + Next.js / React Router framework | CMS 经验复用；适合把阅读站发展成账号、编辑、协作产品 | React 本身不提供完整站点内容架构；仍需框架、Markdown、路由与部署方案 | 产品需求改变时再选 |

Astro 与后三个 UI 库并非同一层：Astro 已官方支持 React、Svelte 和 Solid 组件。比较整站替换应是 Astro / SvelteKit / SolidStart / React 站点框架；比较交互组件则另行选择。React JSX 和 Solid JSX 语义不同，不能直接搬运 hooks 或组件库。

## 建议的边界

公开站：Astro routes/layouts → Content Layer → 0xmd 发布的 Markdown。只在交互需要时加载客户端组件。

写作端：继续 Electron + React → cms-core → Git 发布流程。此轮评估不要求重写 CMS。

视觉基础：token、字体、间距、主题与图标尺寸约定可以共享；页面组件分别遵循阅读端与编辑端需求。先在 site 内落实，出现真实第二个消费者时再提取独立设计 token 包。不要让 CMS 通过相对路径读取 site 内部样式，也不要为了共享 Button 强制把所有静态组件 React 化。

## Astro 升级关注点

1. 先固定现有内容 fixture、URL、RSS、生成 HTML 与构建时间基线，再独立进行 5 → 6 → 7 的迁移验证。迁移与视觉重构分开，避免难以归因。
2. Astro 6 涉及 Zod 4、Shiki 4、Vite 环境与 adapters；当前 `z` 从 `astro:content` 导入，应改为 `astro/zod` 并验证 schema 行为。
3. Astro 7 默认引入 Rust 编译器、Vite 8 与新的 Markdown 处理器。本站依赖 `remarkSanitizeLinkHtml` 和 `rehypeCodeBlock`；优先按官方迁移指南显式使用兼容的 unified / `@astrojs/markdown-remark` 管线。验证后才决定是否重写插件迁往新处理器，不可因升级丢掉链接处理或代码块功能。
4. `.astro` 新编译器的标签严格度与 inline 元素空白处理可能改变 HTML，检查 Header、正文内联内容与 RSS，不能只看 build 是否通过。
5. MDX 仍在内容 loader 契约中；本地样本没有 MDX 不能证明远端内容不使用它。移除 MDX 或 React integration 前检查完整内容源与产品需求。
6. 现有 `output: static` 加 Vercel adapter 不意味着必须 SSR，也不意味着 adapter 可以无条件删除。核对图像和平台配置后再精简。
7. 验收现有同步测试与内容端到端测试，再覆盖两个 Markdown 插件、主题与复制、长代码、404/slug、RSS/sitemap 及 Vercel 预览。构建速度提升只报告本站实测，不套用官方百分比。

此次未运行升级试验，因此尚未确认所有依赖和内容插件在 Astro 7 上兼容，也没有宣称得到构建或客户端性能收益。

## 官方资料

- [Astro 7 发布说明](https://astro.build/blog/astro-7/)：编译器、Vite 与 Markdown 管线变化。
- [Astro 6 迁移](https://docs.astro.build/en/guides/upgrade-to/v6/) / [Astro 7 迁移](https://docs.astro.build/en/guides/upgrade-to/v7/)：逐项升级依据。
- [Astro UI 框架集成](https://docs.astro.build/en/guides/framework-components/)：组件默认渲染与客户端激活。
- [SvelteKit 静态站点](https://svelte.dev/docs/kit/adapter-static)：静态预渲染支持。
- [Svelte 2026 年 9 月更新](https://svelte.dev/blog/whats-new-in-svelte-september-2026)：当前生态更新。
- [SolidStart v2](https://docs.solidjs.com/solid-start/v2)：Solid 1、Vite 8 与部署插件方向。
- [React 应用创建建议](https://react.dev/learn/creating-a-react-app)：React 与站点框架的关系。

## 样式方案补充：Panda CSS / StyleX

用户提出以 Panda CSS 或 StyleX 替换现有 Tailwind。此项更新样式层选型，不改变前述 Astro 与 islands 的职责划分。建议优先 Panda CSS；这是待验证的选型建议，尚未安装或迁移。

| 维度 | Panda CSS | StyleX |
| --- | --- | --- |
| Astro 接入 | 官方提供 `.astro` 扫描、PostCSS 与 `class={css(...)}` 示例 | 官方提供 Vite、编译器等接入；本次未找到等价的专门 Astro 指南，需要验证 `.astro`/外部样式模块的实际处理 |
| Design system | tokens、semanticTokens、textStyles、recipes/slot recipes 可直接表达当前规范 | defineVars/createTheme、类型化样式组合可建立系统；变体更多以 JS 组合表达 |
| Markdown 正文 | 可通过集中 Prose 规则与嵌套选择器处理生成的 HTML | 应验证生成 HTML 的样式路径；可保留引用同一 token 的集中正文 CSS，不能假定所有节点都已由组件控制 |
| 优势 | 对当前 Astro + 少量 React 的结构，系统建模和落地路径更直接 | 可预测的跨组件样式合并、限制可覆盖属性的类型契约，适合重视组合约束的组件体系 |
| 需验证 | codegen、watch、静态提取、动态 recipe variants、生产 CSS 输出 | 编译器链、CSS 输出、主题与 Astro 静态/React hydration 路径 |

StyleX 并非 React 专属，也有主题与 token 能力；不以“无法用于 Astro”作为淘汰理由。两者都主要在构建时生成 CSS，但不要将其描述为所有场景零 JS：Panda 的 class-name 工具和 StyleX 的样式组合有各自运行时；静态 Astro 页面上的调用可在服务端/构建期完成，islands 要测实际客户端产物。

建议落地：

1. Astro 升级单独验证；样式迁移以同一 fixture 为比较基线。
2. 用 Panda config 作为 token 唯一源，迁入目前 CSS 草案的语义颜色、字号/行高、间距、圆角和主题；预览引用生成 token，删除手写重复定义。
3. 为实际存在的 IconButton、PostList 与 Prose 建立有限 recipes/textStyles，不给每个 div 建新抽象。
4. 先迁移 Header、文章行和一篇包含代码/表格的正文。通过生产 build、dev watch、暗色、移动端和 islands 验证，再清除其余 Tailwind 与 Typography 用法。
5. 短暂共存阶段只保留一个 reset/preflight，显式安排 CSS layer 顺序；不要让同一组件长期混用两套样式系统。
6. strictTokens 与类型检查可减少任意值；仍需审查逃逸值、动态拼接、内容来源及真实对比度。动态 recipe variants 必须能被提取，必要时有限预生成，不能无限 safelist。
7. 只有当需要更强的组件覆盖契约，且愿意承担对应编译整合时，再选择 StyleX；不同时引入两套工具。

资料：[Panda Astro](https://panda-css.com/docs/installation/astro)、[tokens](https://panda-css.com/docs/theming/tokens)、[recipes](https://panda-css.com/docs/concepts/recipes)、[runtime 边界](https://panda-css.com/docs/styled-system)、[StyleX 安装](https://stylexjs.com/docs/learn/installation/)、[StyleX 组合与类型](https://stylexjs.com/docs/learn/thinking-in-stylex/)、[StyleX 变量](https://stylexjs.com/docs/learn/theming/defining-variables/)。
