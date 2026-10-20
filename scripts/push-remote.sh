#!/usr/bin/env bash
# 健壮推送：当前 HEAD → 远端分支（多级降级）
#   ① 直推 HTTPS（gh token 嵌入 URL，绕过 credential helper）——失败自动重试
#   ② 仍失败才转 SSH-over-443 临时部署密钥通道（gh api 注册 → ssh 推送 → 用完即删）
#
# 为什么加重试（2026-10-21）：
#   实测直推的失败是**间歇性网络抖动**（`Failed to connect to github.com port 443`），
#   连续 10 次实测 0 失败、另一时段 1 次即败——不是配置问题。
#   旧脚本「失败一次就建临时密钥」，导致每次抖动都往 GitHub 注册一把部署密钥
#   → GitHub 每次发一封「added a deploy key」邮件。
#   加重试后绝大多数抖动在第 1–3 次就恢复，不再无谓地建钥。
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

# 直推重试次数（1 + 3 次重试 = 最多 4 次尝试）
PUSH_ATTEMPTS="${PUSH_ATTEMPTS:-4}"
PUSH_RETRY_SLEEP="${PUSH_RETRY_SLEEP:-3}"

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

# ① 直推 HTTPS（带重试）
PUSHED=""
for attempt in $(seq 1 "$PUSH_ATTEMPTS"); do
  if git -c credential.helper= push -q \
    "https://x-access-token:${TOKEN}@github.com/${REPO}.git" \
    "HEAD:refs/heads/${BRANCH}" 2>/dev/null; then
    PUSHED="直推"
    [ "$attempt" -gt 1 ] && echo "  ✓ 直推成功（第 ${attempt} 次尝试）" || echo "  ✓ 直推成功"
    break
  fi
  if [ "$attempt" -lt "$PUSH_ATTEMPTS" ]; then
    echo "  … 第 ${attempt} 次直推失败，${PUSH_RETRY_SLEEP}s 后重试"
    sleep "$PUSH_RETRY_SLEEP"
  fi
done

if [ -z "$PUSHED" ]; then
  # ② SSH-over-443 通道。优先复用「固定部署密钥」（scripts/setup-push-key.sh 注册的那把）——
  #    固定密钥只在首次注册时触发一封 GitHub 邮件；临时密钥则每次兜底都会新建一封。
  FIXED_KEY=".worklog/push-key"
  if [ -f "$FIXED_KEY" ]; then
    echo "  ⚠ 直推 ${PUSH_ATTEMPTS} 次均失败，转 SSH-over-443 通道（复用固定部署密钥）…"
    KEYWIN="$(cygpath -m "$(pwd)/$FIXED_KEY" 2>/dev/null || echo "$(pwd)/$FIXED_KEY")"
    if GIT_SSH_COMMAND="ssh -i $KEYWIN -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p 443" \
      git push -q "git@ssh.github.com:${REPO}.git" "HEAD:refs/heads/${BRANCH}" 2>/dev/null; then
      echo "  ✓ SSH 通道推送成功（固定密钥）"
      PUSHED="SSH-固定"
    else
      echo "  ⚠ 固定密钥推送失败，降级为临时密钥…"
    fi
  fi

  # 固定密钥不可用 / 失败 → 临时密钥兜底（会新建一封邮件，仅此时发生）
  if [ -z "$PUSHED" ]; then
    echo "  ⚠ 转 SSH-over-443 临时密钥通道（本次会新建一把部署密钥）…"
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
    echo "  ✓ SSH 通道推送成功（临时密钥，已回收）"
  fi
fi

# 备用通道推送后 origin/* 引用不会自动更新，手动对齐
git update-ref "refs/remotes/origin/${BRANCH}" "$(git rev-parse HEAD)"
echo "✓ 推送完成：${BRANCH} → ${SHA}"
