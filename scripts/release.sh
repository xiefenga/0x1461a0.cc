#!/usr/bin/env bash
set -euo pipefail

# ─── 发布 @0x1461a0/0xmd-core 和 @0x1461a0/0xmd-cli 到 npm ───

PACKAGES=("packages/cms-core" "apps/cms-cli")
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# ─── 参数解析 ───
BUMP=""
DRY_RUN=false
SKIP_GIT=false

usage() {
  cat <<EOF
Usage: $(basename "$0") <patch|minor|major> [options]

Options:
  --dry-run    只构建和打包，不实际发布
  --skip-git   跳过 git tag 和 commit
  -h, --help   显示帮助

Examples:
  scripts/release.sh patch
  scripts/release.sh minor --dry-run
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    patch|minor|major) BUMP="$1"; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    --skip-git) SKIP_GIT=true; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

if [[ -z "$BUMP" ]]; then
  echo "Error: version bump type required (patch|minor|major)"
  usage
fi

# ─── 工具函数 ───
step() { echo -e "\n\033[1;34m▸ $1\033[0m"; }
ok()   { echo -e "\033[1;32m  ✔ $1\033[0m"; }
err()  { echo -e "\033[1;31m  ✖ $1\033[0m"; exit 1; }

get_version() {
  node -p "require('./$1/package.json').version"
}

bump_version() {
  local current="$1"
  local type="$2"
  IFS='.' read -r major minor patch <<< "$current"
  case "$type" in
    major) echo "$((major + 1)).0.0" ;;
    minor) echo "$major.$((minor + 1)).0" ;;
    patch) echo "$major.$minor.$((patch + 1))" ;;
  esac
}

set_version() {
  local pkg_dir="$1"
  local version="$2"
  cd "$ROOT_DIR"
  node -e "
    const fs = require('fs');
    const path = './$pkg_dir/package.json';
    const pkg = JSON.parse(fs.readFileSync(path, 'utf-8'));
    pkg.version = '$version';
    fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
  "
}

# ─── 前置检查 ───
step "Pre-flight checks"
cd "$ROOT_DIR"

if ! command -v pnpm &>/dev/null; then
  err "pnpm not found"
fi

if [[ "$DRY_RUN" == false && "$SKIP_GIT" == false ]]; then
  if [[ -n "$(git status --porcelain)" ]]; then
    err "Working directory not clean. Commit or stash changes first."
  fi
fi

CURRENT_VERSION="$(get_version packages/cms-core)"
NEW_VERSION="$(bump_version "$CURRENT_VERSION" "$BUMP")"
ok "Current version: $CURRENT_VERSION"
ok "New version:     $NEW_VERSION ($BUMP)"

# ─── 确认 ───
echo ""
read -rp "Proceed with release v$NEW_VERSION? [y/N] " confirm
if [[ "$confirm" != [yY] ]]; then
  echo "Cancelled."
  exit 0
fi

# ─── 更新版本号 ───
step "Bump versions to $NEW_VERSION"
for pkg in "${PACKAGES[@]}"; do
  set_version "$pkg" "$NEW_VERSION"
  ok "$pkg → $NEW_VERSION"
done

# ─── 测试 ───
step "Run tests"
pnpm --filter @0x1461a0/0xmd-core test
ok "Tests passed"

# ─── 构建 ───
step "Build packages"
pnpm --filter @0x1461a0/0xmd-core build
pnpm --filter @0x1461a0/0xmd-cli build
ok "Build succeeded"

# ─── 发布 ───
if [[ "$DRY_RUN" == true ]]; then
  step "Dry run — packing only"
  cd "$ROOT_DIR/packages/cms-core" && pnpm pack && rm -f *.tgz
  cd "$ROOT_DIR/apps/cms-cli" && pnpm pack && rm -f *.tgz
  cd "$ROOT_DIR"

  # 还原版本号
  step "Revert version bump"
  for pkg in "${PACKAGES[@]}"; do
    set_version "$pkg" "$CURRENT_VERSION"
  done
  ok "Dry run complete, versions reverted to $CURRENT_VERSION"
else
  step "Publish to npm"

  cd "$ROOT_DIR/packages/cms-core"
  pnpm publish --no-git-checks
  ok "@0x1461a0/0xmd-core@$NEW_VERSION published"

  cd "$ROOT_DIR/apps/cms-cli"
  pnpm publish --no-git-checks
  ok "@0x1461a0/0xmd-cli@$NEW_VERSION published"

  cd "$ROOT_DIR"

  # ─── Git tag ───
  if [[ "$SKIP_GIT" == false ]]; then
    step "Git commit & tag"
    git add packages/cms-core/package.json apps/cms-cli/package.json
    git commit -m "chore: release 0xmd v$NEW_VERSION"
    git tag -a "0xmd-v$NEW_VERSION" -m "0xmd v$NEW_VERSION"
    ok "Tagged 0xmd-v$NEW_VERSION"
    echo ""
    echo "  Run 'git push && git push --tags' to push the release."
  fi
fi

echo ""
echo "Done."
