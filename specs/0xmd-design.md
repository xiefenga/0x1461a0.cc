# 0xmd — Local-first Markdown Content Manager

## Technical Design Document (v1.0)

---

# 1. Overview

## 1.1 Goal

0xmd 是一个 **Local-first 的 Markdown 内容管理客户端核心引擎**。

用户使用 Typora 等本地编辑器写纯 Markdown，手动执行 0xmd 进行校验、索引、变更检测、发布到远端存储。

0xmd 不关心内容如何被消费（site、API 等），只管理内容本身。

## 1.2 Responsibilities

**负责：**

- 扫描本地 Markdown 文件
- 独立管理文章元数据（替代 frontmatter）
- 维护内容索引
- Schema 校验
- 变更检测（ChangeSet）
- 通过 StorageAdapter 发布到远端存储（注入 frontmatter）

**不负责：**

- 页面渲染 / UI / SSG / SEO / CDN
- 数据库存储
- 内容消费端（site、API）的实现

## 1.3 Design Principles

1. Local-first
2. 纯 Markdown 写作体验（不要求作者写 frontmatter）
3. Deterministic
4. 可扩展
5. 高性能（O(n) 扫描）
6. 与消费端解耦

---

# 2. Architecture

## 2.1 Monorepo Structure

```
packages/
  cms-core/              # @0x1461a0/0xmd-core, 核心引擎
apps/
  cms-cli/               # @0x1461a0/0xmd-cli, CLI 工具 (命令名: 0xmd)
  site/                  # Astro 站点, 与 0xmd 无直接关系
```

未来可扩展：

- `apps/cms-server/` — HTTP API 服务
- `apps/cms-studio/` — 带 UI 的管理工具

## 2.2 Data Flow

```
本地 Markdown 文件（输入, 始终是本地文件系统）
        |
    cms-core
    ├── 扫描文件
    ├── 解析 Markdown
    ├── 管理 metadata（独立于文件, 存在 .0xmd/ 中）
    ├── 生成 hash
    ├── Schema 校验
    ├── 变更检测（与 manifest 比对）
    └── 构建索引
        |
    StorageAdapter（发布到 cms storage）
        |
    ┌──────────────────────────┐
    │  GitAdapter (v1)         │  注入 frontmatter -> commit -> push
    │  HttpAdapter (未来)       │
    └──────────────────────────┘
        |
    cms storage（git 仓库 / HTTP 服务）
        |
    site 从 cms storage 获取内容
    ├── git clone + glob loader（当前）
    └── custom loader via HTTP（未来）
```

## 2.3 Core Layers

```
┌────────────────────────────┐
│      CLI (apps/cms-cli)    │
├────────────────────────────┤
│      Content Manager       │
├────────────────────────────┤
│      Domain Layer          │
├────────────────────────────┤
│    StorageAdapter (Output) │
└────────────────────────────┘
```

Input（本地文件系统读取）不做抽象，直接使用 Node fs/promises。

StorageAdapter 仅针对输出端做适配。

---

# 3. File Structure

## 3.1 Global Config

```
~/.0xmd/
  0xmd.config.yml          # 全局配置
```

```yaml
# ~/.0xmd/0xmd.config.yml
contentDir: /path/to/my/content
git:
  remote: git@github.com:xxx/content-repo.git
  branch: main
patterns:
  - "**/*.md"
```

## 3.2 Content Directory

```
<contentDir>/
  .0xmd/
    manifest.json        # 变更检测用的 hash 快照（id -> hash）
    index.json           # 内容索引（metadata only, 不含 body）
    metadata.json        # 所有文章的元数据（替代 frontmatter）
    path-map.json        # id -> path 映射（用于检测删除的文件）
  hello-world.md         # 纯 Markdown, 无 frontmatter
  some-dir/
    another-post.md      # 目录结构自由, 不强制规范
```

内容目录不强制任何目录结构，根据 glob patterns 扫描所有匹配的 Markdown 文件。

---

# 4. Core Concepts

## 4.1 Metadata Management

用户不在 Markdown 中写 frontmatter，元数据由 0xmd 在 `.0xmd/metadata.json` 中统一管理。

```ts
// metadata.json
interface MetadataStore {
  [filePath: string]: {
    title: string           // 必填
    slug: string           // 未提供则从文件名生成
    tags: string[]         //  0 到多个
    description: string    // 默认空字符串
    created: string         // 创建时间（UTC，ISO 8601 + Z，如 "2025-01-01T00:00:00Z"）
    updated: string         // 更新时间（UTC，ISO 8601 + Z）
  }
}
```

新文件首次扫描时，0xmd 生成初始 metadata：

- `title`: 从文件名推导
- `slug`: 从 title 生成（通过 transliteration 库转拼音再 kebab-case）
- `tags`: 默认空数组
- `description`: 默认空字符串
- `created`: 取文件创建时间（UTC，`birthtime.toISOString()`，Z 格式）
- `updated`: 取文件修改时间（UTC，`mtime.toISOString()`，Z 格式）

用户可通过 CLI 修改 metadata。

## 4.2 ContentEntity

cms-core 内部模型：

```ts
interface ContentEntity {
  id: string                  // 唯一主键，基于文件路径生成（稳定）
  slug: string                // URL slug，基于 title 生成（可变）
  path: string                // 相对于 contentDir 的路径
  body: string                // Markdown 正文
  metadata: MetadataEntry     // 来自 metadata.json
  hash: string                // sha256(meta + body)
}
```

### Rules

- `id` 是唯一主键，不允许重复
- `id` 基于文件路径生成，路径不变则 ID 不变（稳定性保证）
- `slug` 独立于 `id`，用于 URL 路由，可由用户自定义
- `hash` 基于 meta + body 计算

## 4.3 ID Generation

**ID**（稳定主键）= `slugify(filePath去扩展名)`

使用 `transliteration` 库的 `slugify` 函数，支持中文转拼音：

- `hello-world.md` → `hello-world`
- `posts/你好世界.md` → `posts-ni-hao-shi-jie`
- `posts/my-post.md` → `posts-my-post`

ID 仅依赖文件路径，不受 title/slug/metadata 变更影响。文件重命名/移动视为删除旧的 + 新增新的。

**Slug**（URL 路由）优先级：

1. `metadata.slug`（用户自定义）
2. `slugify(metadata.title)`（自动生成）
3. 退化为 `id`（即基于路径）

Slug 变更不影响 changeset 检测（因为 manifest 用 id 作为 key）。

## 4.4 Manifest

用于变更检测。

```ts
// manifest.json
// Maps content id -> hash
type Manifest = Record<string, string>
```

删除文件的检测依赖独立的 `path-map.json`（`id → path` 映射），在每次 scan 和 updateManifest 时同步更新。

## 4.5 Index

用于查询优化。内存中持有完整 ContentEntity，写入 index.json 时自动去除 body。

```ts
// index.json
interface ContentIndex {
  byId: Record<string, ContentEntity>
  bySlug: Record<string, ContentEntity>
  byTag: Record<string, ContentEntity[]>
  sortedByDate: ContentEntity[]           // 按 created 降序
}
```

## 4.6 ChangeSet

```ts
interface ChangeSet {
  added: ContentEntity[]                    // 新增的实体
  updated: ContentEntity[]                  // 变更的实体
  removed: Array<{ id: string; path: string }>  // 删除的实体（id + 文件路径）
}
```

added/updated 持有完整实体引用，供 StorageAdapter 直接使用，无需二次查找。removed 只保留 id 和 path（因为文件已不存在）。

---

# 5. Change Detection

## 5.1 Hash Strategy

```
sha256(meta + body)
```

文件级 hash，用于判断内容是否变更。

## 5.2 Diff Algorithm

1. 扫描所有匹配的 Markdown 文件
2. 解析内容，读取 metadata
3. 生成 hash
4. 与 manifest 比较
5. 生成 ChangeSet
6. 更新 manifest

时间复杂度：O(n)

---

# 6. Schema Validation

## 6.1 Schema Definition

cms-core 使用 Zod 定义 metadata schema（`MetadataEntrySchema`），独立存放于 `schemas.ts`，与纯类型定义分离。

校验通过 `validateEntities()` 函数执行，检查所有实体的元数据完整性和一致性。

site 侧的 schema 独立维护，不共享。

## 6.2 Error Types

- Duplicate ID
- Duplicate Slug
- Missing Required Field（title）
- Invalid Slug Format
- Invalid Date

校验在 validate 阶段执行（`0xmd validate` 命令或 publish 前自动触发）。

---

# 7. StorageAdapter

## 7.1 Interface

```ts
interface StorageAdapter {
  publish(changeSet: ChangeSet, allEntities: ContentEntity[]): Promise<PublishResult>
}

interface PublishResult {
  success: boolean
  published: number
  removed: number
  commitHash?: string
  message?: string
}
```

## 7.2 GitAdapter (v1)

发布流程：

1. 读取 ChangeSet（added / updated / removed）
2. 对每个文件：读取纯 Markdown + 从 metadata.json 取元数据
3. 注入 frontmatter，生成带 frontmatter 的完整 Markdown
4. 写入到本地 git 仓库 clone
5. git add -> commit -> push

site 侧 git clone 后看到的是带 frontmatter 的标准 Markdown，现有 glob loader 无需修改。

## 7.3 Future Adapters

- HttpAdapter — 上传到 HTTP 服务
- OSSAdapter — 同步到对象存储

---

# 8. Content Manager

核心服务，编排 scan / diff / manifest / index / validate 全流程。

```ts
class ContentManager {
  constructor(config: Config)
  init(): Promise<void>                    // 初始化 .0xmd/ 数据目录
  scan(): Promise<ContentEntity[]>         // 扫描文件, 同步 metadata, 构建实体
  getChangeSet(): Promise<ChangeSet>       // 与 manifest 比对
  updateManifest(): Promise<void>          // 将当前实体快照写入 manifest
  resetManifest(): Promise<void>           // 清空 manifest（所有文件视为新增）
  rebuildIndex(): Promise<ContentIndex>    // 重建索引并写入 index.json
  validate(): ValidationResult             // 校验所有实体
  getEntities(): ContentEntity[]           // 获取当前扫描到的实体列表
}
```

---

# 9. CLI Commands

命令名：`0xmd`

### `0xmd init`

交互式创建配置文件 `~/.0xmd/0xmd.config.yml`。

交互流程：
1. 检测已有配置 → 提示是否覆盖
2. 输入 `contentDir`（绝对路径）→ 检测目录是否存在，不存在则警告
3. 输入 Git remote URL
4. 输入 Git branch（默认 `main`）
5. 输入文件匹配 patterns（逗号分隔，默认 `**/*.md`）
6. 写入 YAML 配置文件

### `0xmd status`

显示配置和内容状态概览。

输出内容：
- 配置文件路径及是否存在
- `contentDir`、`git.remote`、`git.branch`、`patterns`
- `.0xmd/` 数据目录路径
- `metadata.json` 条目数
- `manifest.json` 条目数
- `path-map.json` 条目数
- `index.json` 是否存在

兼容未初始化状态，逐步检测，缺少前置文件时提示并提前返回。

### `0xmd scan`

扫描内容目录，检测新文件，生成初始 metadata。

输出每个实体的 id、path、slug、title、tags。

### `0xmd diff`

显示 ChangeSet（added / updated / removed），末尾输出汇总行。

### `0xmd validate`

校验所有实体的 metadata，输出错误列表。校验失败时 exit(1)。

### `0xmd build-index`

重建 `index.json`，输出索引条目数。

### `0xmd reset-manifest`

清空 manifest 和 path-map，使所有文件视为新增。

### `0xmd publish`

完整发布流程：validate → compute changeset → 显示变更 → 确认 → GitAdapter.publish → 更新 manifest + index。

参数：
- `--dry-run` — 仅显示变更，不执行发布
- `--yes` / `-y` — 跳过确认提示

---

# 10. Concurrency

## 10.1 Parsing

- 并行读取文件
- 限制并发数量（p-limit, 默认 10）

## 10.2 Atomic Write

- 写 manifest / index / metadata 使用临时文件 + rename
- 避免写入中断导致文件损坏

---

# 11. Performance Targets

| 内容规模 | 目标扫描时间 |
| -------- | ------------ |
| 100      | < 200ms      |
| 1,000    | < 1s         |
| 5,000    | < 3s         |

---

# 12. v1 Scope

## Must Have

- Markdown 扫描 + 解析
- 独立 metadata 管理（.0xmd/metadata.json）
- ID / Slug 生成
- Hash 计算
- Schema 校验（Zod）
- Manifest + ChangeSet 变更检测
- Index 构建
- GitAdapter（注入 frontmatter -> commit -> push）
- CLI 命令

## Not in v1

- HttpAdapter / OSSAdapter
- Watch mode
- HTTP API / Server
- GUI / Studio
- 多用户 / 权限
- 内容版本控制
- 实时协作 / CRDT

---

# 13. Technology Stack

## 13.1 Runtime & Language

| 项目 | 选型 | 说明 |
|------|------|------|
| Runtime | Node.js 24 | 与 monorepo 一致 (Volta 24.13.1) |
| Language | TypeScript 5.9 | 与 monorepo 根依赖一致，strict mode |
| Module | ESM only | `"type": "module"`，与 monorepo 一致 |
| Package Manager | pnpm 10 | 与 monorepo 一致 |

## 13.2 packages/cms-core

| 用途 | 选型 | 说明 |
|------|------|------|
| Schema 校验 | Zod | 轻量、TS-first，运行时类型校验 |
| Hash 计算 | Node.js crypto (内置) | `sha256`，无需额外依赖 |
| 文件读取 | Node.js fs/promises (内置) | 设计原则：输入端不做抽象 |
| Glob 扫描 | fast-glob | 高性能 glob 匹配，支持 `**/*.md` |
| YAML 解析 | yaml | 读取 `0xmd.config.yml` + 生成 frontmatter YAML |
| Slug / ID 生成 | transliteration | Unicode → Latin 转写 + slugify，支持中文转拼音 |
| 并发控制 | p-limit | 文件并行读取，默认 10 并发 |
| Git 操作 | simple-git | GitAdapter 用，git add / commit / push |
| 构建工具 | tsup | 基于 esbuild，快速打包 ESM，零配置 |
| 测试框架 | vitest | TS 原生支持，ESM 友好 |

## 13.3 apps/cms-cli

| 用途 | 选型 | 说明 |
|------|------|------|
| CLI 框架 | citty | 轻量、TS-first、ESM 原生 (unjs 生态) |
| 终端输出 | consola | 与 citty 同生态，结构化日志 |
| 构建工具 | tsup | 与 cms-core 一致，输出可执行 bin |

## 13.4 不引入的技术

| 类别 | 不用 | 原因 |
|------|------|------|
| ORM / DB | - | 纯文件系统工具，无数据库需求 |
| HTTP 框架 | - | v1 无 HTTP API |
| CLI 框架 | commander / yargs | 过重，citty 更轻量更现代 |
| 测试 | jest | vitest 更快，ESM 原生支持更好 |
| Markdown AST | remark / unified | v1 只需读取原始 body，不做 AST 解析 |
| Bundler | webpack / rollup | tsup (esbuild) 足够 |

## 13.5 TypeScript 配置策略

cms-core 和 cms-cli 各自维护 `tsconfig.json`，继承根目录 strict + ESNext + Bundler 配置方向。当前只有两个包，不创建共享 `tsconfig.base.json`。

## 13.6 Turbo Task 扩展

在现有 turbo.json 基础上新增 `test` task，cms-cli 的 `build` 通过 `^build` 依赖 cms-core 的 `build`。

---

# 14. Future Evolution

- HttpAdapter / OSSAdapter
- Watch mode（文件变更自动触发）
- HTTP API Server（cms-server）
- Web UI（cms-studio）
- Content relations / Dependency graph
- 分区 manifest / 分区索引
- 增量构建触发器
- Plugin system
