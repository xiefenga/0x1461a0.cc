# 发布指南

发布 `@0x1461a0/0xmd-core` 和 `@0x1461a0/0xmd-cli` 到 npm。

## 前置条件

1. npm 登录到 `@0x1461a0` scope：

```bash
npm login --scope=@0x1461a0
```

2. 确保工作目录干净（无未提交的改动）。

## 使用发布脚本

```bash
# patch 发布：0.1.0 → 0.1.1
pnpm release patch

# minor 发布：0.1.0 → 0.2.0
pnpm release minor

# major 发布：0.1.0 → 1.0.0
pnpm release major
```

脚本自动执行以下步骤：

1. 检查工作目录是否干净
2. 同步更新两个包的版本号
3. 运行测试
4. 构建
5. 按依赖顺序发布（先 core 后 cli）
6. 创建 git commit 和 tag（`0xmd-v{version}`）

发布完成后手动推送：

```bash
git push && git push --tags
```

## 选项

```bash
# 试运行，只打包不发布
pnpm release patch --dry-run

# 跳过 git commit/tag（CI 场景或手动管理 git）
pnpm release patch --skip-git
```

## 手动发布

如果不用脚本，按以下顺序操作：

```bash
# 1. 更新两个 package.json 中的 version 字段（保持一致）

# 2. 测试 + 构建
pnpm test
pnpm build

# 3. 先发 core（cli 依赖它）
cd packages/cms-core
pnpm publish --no-git-checks

# 4. 再发 cli
cd ../../apps/cms-cli
pnpm publish --no-git-checks

# 5. 打 tag
git add -A
git commit -m "chore: release 0xmd vX.Y.Z"
git tag -a "0xmd-vX.Y.Z" -m "0xmd vX.Y.Z"
git push && git push --tags
```

## 注意事项

- 两个包版本号始终保持同步
- `workspace:*` 依赖在 `pnpm publish` 时会自动替换为实际版本号
- scoped 包已配置 `publishConfig.access: "public"`，无需额外传参
- cli 包的 bin 名称为 `0xmd`，用户安装后可直接使用 `npx 0xmd` 或全局安装
