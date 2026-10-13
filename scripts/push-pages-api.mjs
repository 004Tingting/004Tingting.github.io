#!/usr/bin/env node
/**
 * 备用发布通道：当 github.com:443 不可达（git push 失败）但 api.github.com 可用时，
 * 用 GitHub Git Data API 把 out/ 目录推送到 gh-pages 分支。
 *
 * 背景：国内网络对 github.com 与 api.github.com 的可达性不一致——常见「api 通、github 断」，
 * 此时 git push 必然失败。本脚本只依赖 api.github.com。
 *
 * 用法（项目根目录）：
 *   GITHUB_TOKEN=$(gh auth token) node scripts/push-pages-api.mjs
 *
 * 说明：按 blob sha 差分，只上传变更文件；删除远端多余文件；一次 tree+commit 提交。
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const REPO = process.env.REPO || "004Tingting/004Tingting.github.io";
const BRANCH = process.env.BRANCH || "gh-pages";
const DIR = path.resolve(process.env.DIR || "out");
const TOKEN = process.env.GITHUB_TOKEN;
const API = "https://api.github.com";

if (!TOKEN) {
  console.error("缺少 GITHUB_TOKEN");
  process.exit(1);
}

async function gh(method, url, body) {
  const res = await fetch(API + url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "personal-site-deploy",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${url} -> ${res.status} ${(await res.text()).slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

function blobSha(buf) {
  return crypto
    .createHash("sha1")
    .update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf]))
    .digest("hex");
}

function walk(dir, base = "") {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git") continue;
    const full = path.join(dir, e.name);
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(full, rel));
    else out.push(rel);
  }
  return out;
}

if (!fs.existsSync(DIR)) {
  console.error(`找不到产物目录：${DIR}`);
  process.exit(1);
}

const local = new Map();
for (const rel of walk(DIR)) {
  const buf = fs.readFileSync(path.join(DIR, rel));
  local.set(rel, { buf, sha: blobSha(buf) });
}
console.log(`本地产物 ${local.size} 个文件`);

let headSha = null;
let baseTreeSha = null;
const remoteTree = new Map();
try {
  const ref = await gh("GET", `/repos/${REPO}/git/ref/heads/${BRANCH}`);
  headSha = ref.object.sha;
  const commit = await gh("GET", `/repos/${REPO}/git/commits/${headSha}`);
  baseTreeSha = commit.tree.sha;
  const tree = await gh("GET", `/repos/${REPO}/git/trees/${baseTreeSha}?recursive=1`);
  for (const it of tree.tree) if (it.type === "blob") remoteTree.set(it.path, it.sha);
  console.log(`远端 ${remoteTree.size} 个 blob，head=${headSha.slice(0, 7)}`);
} catch (e) {
  console.log(`（远端分支不可读，将新建：${e.message}）`);
}

const items = [];
let add = 0;
let mod = 0;
let del = 0;
for (const [rel, { buf, sha }] of local) {
  const rsha = remoteTree.get(rel);
  if (rsha === sha) continue;
  const blob = await gh("POST", `/repos/${REPO}/git/blobs`, {
    content: buf.toString("base64"),
    encoding: "base64",
  });
  items.push({ path: rel, mode: "100644", type: "blob", sha: blob.sha });
  rsha ? mod++ : add++;
}
for (const rel of remoteTree.keys()) {
  if (!local.has(rel)) {
    items.push({ path: rel, mode: "100644", type: "blob", sha: null });
    del++;
  }
}
console.log(`增 ${add} / 改 ${mod} / 删 ${del}`);

if (items.length === 0) {
  console.log("无变更，退出");
  process.exit(0);
}

const tree = await gh("POST", `/repos/${REPO}/git/trees`, { base_tree: baseTreeSha, tree: items });
const message = `deploy: ${new Date().toISOString().slice(0, 16).replace("T", " ")} (api)`;
const commitBody = { message, tree: tree.sha };
if (headSha) commitBody.parents = [headSha];
const commit = await gh("POST", `/repos/${REPO}/git/commits`, commitBody);

if (headSha) {
  await gh("PATCH", `/repos/${REPO}/git/refs/heads/${BRANCH}`, { sha: commit.sha, force: true });
} else {
  await gh("POST", `/repos/${REPO}/git/refs`, { ref: `refs/heads/${BRANCH}`, sha: commit.sha });
}
console.log(`✓ 已推送 ${BRANCH} → ${commit.sha.slice(0, 7)}`);
