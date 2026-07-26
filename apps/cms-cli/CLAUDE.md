# CLAUDE.md — @0x1461a0/0xmd-cli

0xmd 的 CLI 工具，基于 cms-core 提供命令行交互。

## 包信息

- 包名：`@0x1461a0/0xmd-cli`
- 命令名：`0xmd`
- 入口：`src/index.ts`
- 产物：ESM only，target node22，带 shebang banner
- 构建：tsup
- 依赖：`@0x1461a0/0xmd-core`（workspace:*）、citty、consola、yaml

## 命令

- `pnpm build` — 构建（tsup，输出 dist/）
- `pnpm dev` — 监听模式构建
- 从 monorepo 根目录运行：`pnpm --filter @0x1461a0/0xmd-cli <script>`

## 目录结构

```
src/
  index.ts              # CLI 入口，注册所有子命令（citty runMain）
  utils.ts              # createCmsService(), handleError()
  commands/
    init.ts             # 交互式创建配置文件（~/.0xmd/0xmd.config.yml）
    status.ts           # 显示配置和内容状态概览
    scan.ts             # 扫描内容目录，显示文件列表和 metadata
    metadata.ts         # 修改 .0xmd/metadata.json 中的外置元数据
    diff.ts             # 显示 ChangeSet（added/updated/removed）
    validate.ts         # 校验所有实体的 metadata
    build-index.ts      # 重建 index.json
    reset-manifest.ts   # 清空 manifest（所有文件视为新增）
    publish.ts          # validate → diff → confirm → GitAdapter.publish → 更新 manifest + index
```

## 设计要点

- 每个命令是独立的 `defineCommand()` 模块，通过 `subCommands` 注册到主命令
- `createCmsService()` 封装了 loadConfig → new CmsService → init 的固定流程
- scan / metadata / diff / validate / publish 与 GUI 共用 cms-core 的 `CmsService`
- `handleError()` 统一错误处理，consola 输出后 exit(1)
- publish 由 `CmsService.publish()` 统一完成 validate → diff → GitAdapter → manifest/index
- init 命令直接使用 yaml 库序列化配置，不依赖 cms-core 的 loadConfig；会检查 contentDir 是否存在并警告
- status 命令兼容未初始化状态，逐步检测 config → dataDir → metadata/manifest/path-map/index
