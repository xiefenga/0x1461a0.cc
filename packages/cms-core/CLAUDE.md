# CLAUDE.md — @0x1461a0/0xmd-core

0xmd 核心引擎，Local-first 的 Markdown 内容管理系统。

## 包信息

- 包名：`@0x1461a0/0xmd-core`
- 入口：`src/index.ts`
- 产物：ESM only，target node22
- 构建：tsup
- 测试：vitest（globals 模式）

## 命令

- `pnpm build` — 构建（tsup，输出 dist/）
- `pnpm dev` — 监听模式构建
- `pnpm test` — 运行测试（vitest run）
- 从 monorepo 根目录运行：`pnpm --filter @0x1461a0/0xmd-core <script>`

## 目录结构

```
src/
  index.ts              # 包入口，re-export 所有公开 API（直接指向源文件，无 barrel）
  types.ts              # Zod schema + 所有类型定义（MetadataEntry, ContentEntity, Manifest, ChangeSet 等）
  config/
    schema.ts           # ConfigSchema（Zod），Config 类型
    loader.ts           # loadConfig(), getConfigPath(), getDataDir()
  utils/
    hash.ts             # computeHash() — sha256(meta + body)
    id.ts               # generateId()（路径派生，稳定），generateSlug()（title 派生，可变）
    markdown.ts         # injectFrontmatter() — 注入 YAML frontmatter
    fs.ts               # atomicWrite(), ensureDir(), readJsonFile(), writeJsonFile()
  core/
    metadata.ts         # loadMetadata(), saveMetadata(), syncMetadata()
    scanner.ts          # scanContentDir()（fast-glob），buildEntities()（p-limit 并发）
    diff.ts             # computeChangeSet(), findRemoved()
    indexer.ts          # buildIndex() — byId, bySlug, byTag, sortedByDate
    validator.ts        # validateEntities() — 校验 title、重复 id/slug、slug 格式、日期
    content-manager.ts  # ContentManager 类 — 编排 scan/diff/manifest/index/validate
  application/
    cms-service.ts      # CmsService — CLI/GUI 共享的 inspect/metadata/publish 应用服务
  storage/
    storage-adapter.ts  # StorageAdapter 接口，PublishResult 类型
    git-adapter.ts      # GitAdapter — clone/pull + 注入 frontmatter + commit/push
```

## 核心设计

- **ID 基于文件路径**：`generateId(filePath)` = `slugify(路径去扩展名)`，使用 `transliteration` 库支持中文转拼音
- **Slug 独立于 ID**：`generateSlug()` 优先取 `metadata.slug`，其次 `slugify(title)`，最后退化为 ID
- **元数据外置**：用户不写 frontmatter，元数据存在 `.0xmd/metadata.json`，发布时注入
- **过渡兼容**：`frontmatter.policy: preserve` 允许旧源文件暂时保留已有 frontmatter，并在发布时原样保留；默认 `forbid`
- **变更检测**：`sha256(meta + body)` 与 manifest 比对，生成 ChangeSet（added/updated/removed）；`path-map.json` 只与成功发布的 manifest 同步
- **原子写入**：所有 JSON 文件写入使用 tmp + rename 策略

## 测试

测试文件位于各模块的 `__tests__/` 目录下，加上 `src/__tests__/e2e.test.ts` 端到端测试。

测试使用临时目录（`mkdtemp`），不依赖外部状态。

## 依赖

- `zod` — schema 校验
- `fast-glob` — 文件扫描
- `p-limit` — 并发控制
- `transliteration` — Unicode 转 Latin（中文转拼音）+ slugify
- `yaml` — YAML 解析/序列化
- `simple-git` — Git 操作（GitAdapter）
