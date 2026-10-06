#!/usr/bin/env bash
# 一键发布：本地构建 → 推送 gh-pages 分支 → 触发 Pages 构建
#
# 为什么用这个而不是 GitHub Actions：
#   2026-10-06 GitHub Actions 发生 major outage，免费 runner 长时间排队（15 分钟超时失败），
#   遂改为「本地构建 + 分支部署」，完全摆脱对 Actions runner 调度的依赖。
#
# 用法：bash scripts/deploy.sh
# 说明：本地产物与线上完全一致（同一套源码 + 同一次构建）。

set -euo pipefail
cd "$(dirname "$0")/.."

# WorkBuddy 会话内：平台内部代理会掐断 gh / git 的 GitHub 请求，统一清掉
unset HTTPS_PROXY HTTP_PROXY https_proxy http_proxy

# 禁止 git 交互式凭据提示 —— 双保险：即使 token 获取失败也只会报错，不弹 GUI 对话框
export GIT_TERMINAL_PROMPT=0
export GCM_INTERACTIVE=never

REPO="004Tingting/004Tingting.github.io"
REMOTE="https://github.com/${REPO}.git"

echo "▸ 1/3 构建静态产物…"
npm run build

echo "▸ 2/3 推送到 gh-pages 分支…"
cd out
if [ ! -d .git ]; then
  git init -b gh-pages -q
  git remote add origin "$REMOTE"
fi
# 关闭换行符转换：产物是部署文件，无需 CRLF 归一（也避免大量转换开销）
git config core.autocrlf false
git add -A
git -c user.name="004Tingting" -c user.email="SaiKouTING004@outlook.com" \
  commit -q -m "deploy: $(date '+%Y-%m-%d %H:%M')" || echo "  （无变更）"

# 推送：优先用 gh 的 token 直接推送
# 原因：本机系统级配置了 credential.helper=helper-selector（WorkBuddy PortableGit），
#       它会在每次凭据请求时弹出 GUI「选择 credential helper」对话框；
#       把 token 嵌进 URL 可完全绕过 credential helper 机制。
TOKEN=""
# 优先用完整路径的 gh（PATH 里的可能是不可用的 stub）
if [ -x "/c/Program Files/GitHub CLI/gh.exe" ]; then
  TOKEN=$("/c/Program Files/GitHub CLI/gh.exe" auth token 2>/dev/null || true)
fi
if [ -z "$TOKEN" ] && command -v gh >/dev/null 2>&1; then
  TOKEN=$(gh auth token 2>/dev/null || true)
fi

if [ -n "$TOKEN" ]; then
  git push -f -q "https://x-access-token:${TOKEN}@github.com/${REPO}.git" gh-pages
else
  # 兜底：显式指定 GCM，避免落到 helper-selector
  git config --local credential.helper manager
  git push -f -q origin gh-pages
fi
cd ..

echo "▸ 3/3 触发 Pages 构建…"
# 注意：WorkBuddy 会话内需清代理（平台内部代理会掐断 GitHub 请求）
if command -v gh >/dev/null 2>&1; then
  GH="gh"
elif [ -x "/c/Program Files/GitHub CLI/gh.exe" ]; then
  GH="/c/Program Files/GitHub CLI/gh.exe"
else
  GH=""
fi

if [ -n "$GH" ]; then
  env -u HTTPS_PROXY -u HTTP_PROXY -u https_proxy -u http_proxy \
    "$GH" api -X POST "repos/${REPO}/pages/builds" --jq '.status' 2>/dev/null \
    && echo "  ✓ 已触发（Pages 构建完成后生效，约 1–2 分钟）" \
    || echo "  ⚠ 触发失败，可稍后手动访问仓库 Pages 设置重新触发"
else
  echo "  ⚠ 未找到 gh CLI，跳过触发（可到 GitHub Pages 设置页手动 Rebuild）"
fi

echo "✓ 发布流程结束"
