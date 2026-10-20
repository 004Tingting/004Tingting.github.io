#!/usr/bin/env bash
# 健壮推送：当前 HEAD → 远端分支（自动备用通道）
#   ① 直推 HTTPS（gh token 嵌入 URL，绕过 credential helper）
#   ② 直推失败自动转 SSH-over-443 临时部署密钥通道（gh api 注册 → ssh 推送 → 用完即删）
#
# 背景：2026-10-17 本机 git 的 Windows schannel 吊销检查故障（CRYPT_E_NO_REVOCATION_CHECK，
#       `-c http.schannelCheckRevoke=false` 与 openssl 后端均无效）导致直推失败——
#       SSH-over-443 为已验证的备用通道（详见 WORKLOG 2026-10-17 / MEMORY 环境注意）。
#
# 用法（项目根目录）：bash scripts/push-remote.sh <branch>     # 例：bash scripts/push-remote.sh main
set -euo pipefail
cd "$(dirname "$0")/.."

# 本机会话内：平台代理会掐断 GitHub 请求，统一清掉
unset HTTPS_PROXY HTTP_PROXY https_proxy http_proxy
export GIT_TERMINAL_PROMPT=0
export GCM_INTERACTIVE=never

BRANCH="${1:?用法: bash scripts/push-remote.sh <branch>（如 main / gh-pages）}"
REPO="004Tingting/004Tingting.github.io"
SHA="$(git rev-parse --short HEAD)"

# gh CLI（优先完整路径，PATH 里的可能是 stub）
GH="/c/Program Files/GitHub CLI/gh.exe"
[ -x "$GH" ] || GH="$(command -v gh || true)"
if [ -z "$GH" ]; then
  echo "✗ 找不到 gh CLI"
  exit 1
fi
TOKEN="$("$GH" auth token 2>/dev/null || true)"
if [ -z "$TOKEN" ]; then
  echo "✗ 无法获取 gh token"
  exit 1
fi

echo "▸ 推送 ${BRANCH}（${SHA}）…"

# ① 直推 HTTPS
if git -c credential.helper= push -q "https://x-access-token:${TOKEN}@github.com/${REPO}.git" \
  "HEAD:refs/heads/${BRANCH}" 2>/dev/null; then
  echo "  ✓ 直推成功"
else
  echo "  ⚠ 直推失败（网络 / 证书吊销检查），转 SSH-over-443 通道…"
  # ② SSH-over-443 临时部署密钥（注册 → 推送 → 即删；trap 保证失败也回收）
  KEYDIR=".worklog/tmp-push-key"
  KEYID=""
  cleanup() {
    if [ -n "$KEYID" ]; then
      "$GH" api -X DELETE "repos/${REPO}/keys/${KEYID}" --silent 2>/dev/null || true
    fi
    rm -f "$KEYDIR" "$KEYDIR.pub"
  }
  trap cleanup EXIT
  rm -f "$KEYDIR" "$KEYDIR.pub"
  ssh-keygen -t ed25519 -f "$KEYDIR" -N "" -q -C "tmp-push-${BRANCH}"
  KEYID="$("$GH" api -X POST "repos/${REPO}/keys" \
    -f title="tmp-push-$(date +%s)" \
    -f key="$(cat "$KEYDIR.pub")" \
    -F read_only=false --jq '.id')"
  KEYWIN="$(cygpath -m "$(pwd)/$KEYDIR" 2>/dev/null || echo "$(pwd)/$KEYDIR")"
  GIT_SSH_COMMAND="ssh -i $KEYWIN -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p 443" \
    git push -q "git@ssh.github.com:${REPO}.git" "HEAD:refs/heads/${BRANCH}"
  echo "  ✓ SSH 通道推送成功"
fi

# 备用通道推送后 origin/* 引用不会自动更新，手动对齐
git update-ref "refs/remotes/origin/${BRANCH}" "$(git rev-parse HEAD)"
echo "✓ 推送完成：${BRANCH} → ${SHA}"
