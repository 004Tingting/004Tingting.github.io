#!/usr/bin/env bash
# 一次性注册「固定部署密钥」到 GitHub（push-remote.sh 的 SSH 备用通道会复用它）
#
# 为什么要固定密钥：
#   旧逻辑每次 SSH 兜底都新建一把临时密钥、推完即删 —— GitHub 对「添加部署密钥」
#   会发邮件，于是每次抖动都收到一封「added a deploy key」。
#   注册一把长期密钥后，只在**第一次**注册时收到一封，之后所有推送复用。
#
# 安全边界：
#   - 私钥存在 .worklog/push-key（.worklog/ 已 gitignore，永不入库）
#   - 密钥是 **repo-scoped deploy key**，只对这个仓库有效，不是账号级凭据
#   - 随时可在 GitHub → Settings → Deploy keys 撤销，或跑本脚本 --revoke
#
# 用法：
#   bash scripts/setup-push-key.sh          # 注册（幂等：已存在则复用）
#   bash scripts/setup-push-key.sh --revoke # 撤销并删除本地私钥
set -euo pipefail
cd "$(dirname "$0")/.."

REPO="004Tingting/004Tingting.github.io"
KEYDIR=".worklog/push-key"
KEYIDFILE=".worklog/push-key.id"
GH="/c/Program Files/GitHub CLI/gh.exe"
[ -x "$GH" ] || GH="$(command -v gh || true)"
[ -n "$GH" ] || { echo "✗ 找不到 gh CLI"; exit 1; }

unset HTTPS_PROXY HTTP_PROXY https_proxy http_proxy

# ---------- 撤销 ----------
if [ "${1:-}" = "--revoke" ]; then
  if [ -f "$KEYIDFILE" ]; then
    KID="$(cat "$KEYIDFILE")"
    echo "▸ 撤销部署密钥 id=${KID} …"
    "$GH" api -X DELETE "repos/${REPO}/keys/${KID}" --silent 2>/dev/null || true
    rm -f "$KEYIDFILE"
    echo "  ✓ 已撤销"
  else
    echo "  （没有记录密钥 id，可在 GitHub → Settings → Deploy keys 手动删）"
  fi
  rm -f "$KEYDIR" "$KEYDIR.pub"
  echo "✓ 本地私钥已删除"
  exit 0
fi

# ---------- 注册（幂等） ----------
if [ -f "$KEYDIR" ] && [ -f "$KEYIDFILE" ]; then
  KID="$(cat "$KEYIDFILE")"
  # 确认远端仍在
  if "$GH" api "repos/${REPO}/keys/${KID}" --jq '.id' >/dev/null 2>&1; then
    echo "✓ 固定部署密钥已存在（id=${KID}），无需重复注册"
    echo "  私钥：${KEYDIR}"
    exit 0
  fi
  echo "  远端密钥已失效，重新注册…"
  rm -f "$KEYDIR" "$KEYDIR.pub" "$KEYIDFILE"
fi

mkdir -p .worklog
rm -f "$KEYDIR" "$KEYDIR.pub"
echo "▸ 生成 ed25519 密钥对…"
ssh-keygen -t ed25519 -f "$KEYDIR" -N "" -q -C "deploy-fixed-$(date +%Y%m%d)"

echo "▸ 注册为部署密钥（read/write）…"
KID="$("$GH" api -X POST "repos/${REPO}/keys" \
  -f title="deploy-fixed-$(date +%Y%m%d)" \
  -f key="$(cat "$KEYDIR.pub")" \
  -F read_only=false --jq '.id')"

echo "$KID" > "$KEYIDFILE"
echo "  ✓ 已注册（id=${KID}）——GitHub 会为此发一封邮件，这是唯一的一封"
echo "✓ 固定部署密钥就绪：${KEYDIR}"
echo "  撤销：bash scripts/setup-push-key.sh --revoke"
