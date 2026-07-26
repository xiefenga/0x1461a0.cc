# @0x1461a0/0xmd-cli

Local-first Markdown 内容管理 CLI 工具。

在本地编辑器（Typora、VS Code 等）中编写纯 Markdown，通过 `0xmd` 扫描、校验、检测变更并发布到远程 Git 仓库。发布时自动注入 frontmatter，本地源文件保持纯净。

## 安装

项目已集成在 monorepo 中，根目录执行：

```bash
pnpm install
pnpm build
```

构建后可通过以下方式运行：

```bash
# 直接执行
node apps/cms-cli/dist/index.js <command>

# 或通过 pnpm
pnpm --filter @0x1461a0/0xmd-cli exec 0xmd <command>
```

## 配置

在 `~/.0xmd/0xmd.config.yml` 创建配置文件：

```yaml
# 本地 Markdown 内容目录（必填）
contentDir: ~/my-blog-content

# Git 远程仓库配置（必填）
git:
  remote: git@github.com:username/blog-content.git
  branch: main          # 可选，默认 main
  cloneDir: ~/.0xmd/repo # 可选，本地 clone 路径

# 文件匹配模式，可选，默认 ["**/*.md"]
patterns:
  - "**/*.md"
  - "**/*.mdx"

# 默认 forbid；旧内容过渡期可设为 preserve
frontmatter:
  policy: forbid
```

`contentDir` 和 `cloneDir` 支持 `~` 路径。

`frontmatter.policy`：

- `forbid`（默认）— 源 Markdown 必须无 frontmatter，发布时从外置 metadata 注入。
- `preserve` — 允许旧源文件保留已有 frontmatter，发布时原样保留，避免重复注入；无 frontmatter 的新文件仍正常注入外置 metadata。

`preserve` 是迁移期兼容模式。旧文件已有 frontmatter 时，外置 metadata 的修改不会覆盖其中字段；完成迁移后应切回 `forbid`。

## 命令

### `0xmd scan`

扫描内容目录，发现 Markdown 文件并同步元数据。

```bash
0xmd scan
# ✔ Found 12 content file(s):
#   hello-world — posts/hello-world.md
#   my-second-post — posts/my-second-post.md
#   ...
```

首次扫描会在 `contentDir/.0xmd/metadata.json` 中为每个文件自动生成初始元数据（title 从文件名推导，created/updated 取文件修改时间）。

### `0xmd metadata`

通过 CLI 修改外置元数据，不改写 Markdown 源文件。

```bash
0xmd metadata posts/hello.md \
  --title "Hello" \
  --slug hello \
  --tags "cms,local-first" \
  --description "Managed outside Markdown"
```

### `0xmd diff`

对比当前内容与上次发布的 manifest，显示变更。

```bash
0xmd diff
# ✔ Added (2):
#   + new-post — posts/new-post.md
#   + another — drafts/another.md
# ⚠ Updated (1):
#   ~ hello-world — posts/hello-world.md
# ✖ Removed (1):
#   - old-post — posts/old-post.md
```

### `0xmd validate`

校验所有内容的完整 metadata schema、重复 id/slug、日期、slug 格式，并拒绝源 Markdown 中的 frontmatter。

```bash
0xmd validate
# ✔ All content is valid.
```

校验失败时列出所有错误并以非零退出码退出。

### `0xmd build-index`

重建内容索引文件（`contentDir/.0xmd/index.json`），包含按 id、slug、tag 分组及按日期排序的视图。

```bash
0xmd build-index
# ✔ Index rebuilt with 12 entries.
```

### `0xmd reset-manifest`

清空 manifest，下次 `diff` 或 `publish` 时所有内容将被视为新增。

```bash
0xmd reset-manifest
# ✔ Manifest has been reset.
```

### `0xmd publish`

完整发布流程：校验 → 计算变更 → 确认 → 写入 Git 仓库（注入 frontmatter）→ commit & push → 更新 manifest 和索引。

```bash
0xmd publish
# ℹ Changes to publish:
#   + 2 added
#   ~ 1 updated
# ? Proceed with publish? (Y/n)
# ✔ Published: 3 written, 0 removed.
#   Commit: a1b2c3d
# ✔ Manifest and index updated.
```

## 典型工作流

```bash
# 1. 在编辑器中写好 Markdown 文件，放入 contentDir

# 2. 扫描，自动生成元数据
0xmd scan

# 3. 用 CLI 维护独立元数据
0xmd metadata post.md --tags "cms,markdown" --description "..."

# 4. 查看变更
0xmd diff

# 5. 校验
0xmd validate

# 6. 发布到远程仓库
0xmd publish
```

## 数据文件

所有数据文件存放在 `contentDir/.0xmd/` 目录下（已加入 `.gitignore`）：

| 文件 | 说明 |
|------|------|
| `metadata.json` | 各文件的元数据（title, slug, tags, description, created, updated） |
| `manifest.json` | 上次发布时的 id → hash 快照，用于变更检测 |
| `index.json` | 内容索引（byId, bySlug, byTag, sortedByDate） |
| `path-map.json` | id → 文件路径映射，用于跟踪删除 |
