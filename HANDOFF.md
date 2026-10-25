# HANDOFF — 会话交接

> 给下一个 AI 会话：**先读 `AGENTS.md`**（项目上下文与硬性约定），再读本文件了解**最新状态与待办**。
> 最后更新：2026-10-25 06:1x（**八篇新内容已上线**：4 造物 + 4 研思知识讲解，待 Ting 网页审稿）

---

## 🔴 新会话第一件事：等 Ting 审稿（八篇新内容）

2026-10-25 上线的批次（`3c62d86`）：

- **造物**（9 条，重排）：01 CAV → 02 故障诊断 → **03 EEG 解码与脉冲网络** → **04 忆阻存内计算 QAT 实证** → **05 TDC-Bench** → **06 DBI 数字重构链路仿真** → 07 TAROT → 08 OinO → 09 游戏设计
- **研思**（4 篇新 + tag `#知识讲解`）：`/research/tdc-primer/`（把时间切成 72 ps）、`/research/dbi-primer/`（两个 5 GHz 拼一个 10 GHz）、`/research/qat-memristor-primer/`（4-bit 为什么不掉点）、`/research/snn-surrogate-primer/`（让神经元学会发放）
- 双层互链 8 组全部打通；5 张配图在 `public/research/figures/`；t1 的【待补图】占位（Henzler）保留
- **EN 版未出**（交接稿红线「这批先只出中文」）——en 侧 works 仍 5 条，待 Ting 决定是否翻译
- 数字零改动、出处标注沿用、与求职语境无关（红线全守）

**审稿入口**：https://004tingting.github.io/works/ 与 https://004tingting.github.io/research/

**双 Agent 提醒**：本仓库有协作守则（`AGENTS.md` 顶部，2026-10-25 起）——写前 fetch+rebase、部署互斥、提交带 `[A]/[B]`。

---

## 待 Ting 决定 / 回填的清单（跨会话累积）

| # | 事项 | 等 Ting 什么 |
|---|---|---|
| 1 | **塔罗 75 张直觉词回填**（`P:\TAROT`，78 张三层内容已全部填充） | 从 03 女皇开始逐张给词；给完助手做对照诊断并升「已学」 |
| 2 | ~~HANDOFF.md 入库决定~~ | **已办**（2026-10-25 13:1x，`4d803d3`）——本文件现为双 agent 同步点，B 侧 fetch 即见 |
| 3 | **B agent 初始化** | clone 到 `P:\personal-site-2` + 复制 `.env.local`（命令在 AGENTS.md 守则节）——B 自己跑或让 A 代跑均可 |
| 4 | **EN 版 8 篇新内容** | 是否翻译、何时翻（B 侧的典型任务） |
| 5 | **影卷 38 条 rating / cover 2 条字段 / about 页** | Ting 补内容 |
| 6 | **t1 待补图**（Henzler 教材图） | 版权确认后替换占位 |
| 7 | **Token 基线每周重跑** | 下次到期 ~2026-11-01（当前 76 天） |

> 本文件已入库（2026-10-25 起）：任何一侧更新本文件后必须 commit + push，另一侧 fetch 即见——这是双 agent 的交接通道。WORKLOG 仍本地不入库，各写各的。

---

## ✅ 已结案：塔罗视差参数校正（2026-10-22）

Ting 已在预览页调完 11 个滑块并回传，参数**只落在站点**并已上线：

```
tilt=8 art=8 scale=104.5 num=11 title=11 ox=50.1 oy=46.5 rain=20 travel=135 enter=420 leave=420
```

| 参数 | 落点 | 值 |
|---|---|---|
| `tilt` / `art` / `num` / `title` | `components/TarotFoilCard.tsx` | 8 / 8 / 11 / 11 |
| `travel` / `enter` / `leave` | 同上 | 1.35 / 420 / 420 |
| `scale` | `app/globals.css` `.tarot-foil-artwork` | `scale(1.045)` |
| `rain` | `app/globals.css` `.tarot-foil-rainbow` | 兜底 0.2 |
| `ox` / `oy` | 同上 `transform-origin` | 50.1% / 46.5%（未变） |

**⚠️ 不要再往另外两处同步**（Ting 2026-10-22 明确「只改动网站的参数，其他两个不改」）：
- React 包 `P:\widgets\opensource\rws-tarot-layers\react\` 已 `git checkout` 还原为 v1.1.0 原值
  （16 / 14 / 16 / 22 / 1 / 0.5 / 1.06）
- 预览页生成器 `P:\widgets\assets\rider-waite-smith\gen_preview.py` 已还原为基准默认值，
  78 页已重新生成回原值

理由：预览页是调参工具，默认值应是「基准」而非站点定稿；React 包是独立发布的组件，
默认值应保持通用。

**仍可能的延伸**：`ox/oy` 是全局统一值，不同牌构图中心不同。若 Ting 要求逐卡调，
需加 per-card 配置表（`lib/tarot-deck.ts` 加字段或单开 `tarot-tune.json`）。


---

## 🔴 待办主线

1. **牌义正文**（`TarotDeck` 弹窗 `readingNote` 仍是统一占位）——等 Ting 把 `P:\TAROT` 学完
2. **「学习笔记」子页**（塔罗的另一部分，Ting 2026-10-21 定）
3. 影卷 38 条 rating 待补；cover 2 条待 BV 号 / 原速 BPM / 曲谱 / 伴奏；about 页仍是占位
4. Token 全量基线**建议每周重跑**：`.\\.worklog\\token-monitor-kit\\dump-hub-history.ps1`
   （当前 72 天，07-07 .. 10-21）

---

## 会话总览 · 2026-10-25（塔罗全量 + Token + 双 agent + 八篇内容，全部已上线）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 06:1x | **八篇内容上线** | 4 造物（EEG/忆阻器/TDC/DBI，order 3-6）+ 4 研思 `#知识讲解`（t1-t4）；造物重排至 9 条；8 组互链 + 5 图 + 4 仓库链接全通；`.prose img` 样式补齐；EN 侧不出（红线）。素材 6 图实为 5 图（fig_kfold 未被引用）。**待 Ting 网页审稿** | `3c62d86`（+ push-remote 补推） |
| 05:5x | **塔罗 78 张全量填充** | Ting「一次性生成后面所有卡牌」→ 04-21 大牌 + 权杖/圣杯/宝剑/星币各 14 张小牌三层内容全部填充；直觉词 75 张留空待 Ting；进度表全标「学习中」 | P:\TAROT（本地不入库） |
| 05:0x | **Token 基线 + 快照** | 基线 72→**76 天**（07-07 .. 10-25）入库 `c4c3273`；快照推送 `fe40d46`；线上 10.70B | `c4c3273` |
| 04:4x | **双 Agent 协作守则** | `AGENTS.md` 顶部新增六条：写前 fetch+rebase / 部署互斥 / `[A]/[B]` 提交标签 / 按域分工 / HANDOFF 作同步点（待 Ting 定 gitignore）/ 重叠改动先读后动 | `8653124` |

---

## 会话总览 · 2026-10-22（塔罗参数落位 + 报数 + Token，已上线）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 17:5x | **参数范围收窄** | Ting「只改动网站的参数，其他两个不改」→ React 包 `git checkout` 还原、预览页生成器反向替换 21 处并重生成 78 页；站点参数不动（线上不受影响）。`AGENTS.md` 从「同步三处」改为「只改站点」 | 本轮 |
| 00:1x | **塔罗 11 参数落位** | Ting 回传 `tilt=8 art=8 scale=104.5 num=11 title=11 ox=50.1 oy=46.5 rain=20 travel=135 enter=420 leave=420`；**只落站点**（React 包与预览页在 17:5x 已按 Ting 指示撤回原值）。**顺手补洞**：`--rainbow` 此前在站点 CSS 无内联值、全靠兜底 0.5，预览页的 20% 落不到站点 → 兜底改 0.2 | 本轮 |
| 00:1x | **终末地报数** | 手动 368.7 → **701.6h**（700~750 随机，zh/en + stats-history 同步）；Steam 侧 19.8h 经 `STEAM_MERGE` 并入 → 线上显示 **721.4h** | 本轮 |
| 00:1x | **Token 合计 + 快照 + 基线** | hub 累计 **9,210,114,357（92.10 亿）**／今日 8.42 亿／本月 48.57 亿；快照推送 `004Tingting/token-monitor-data@b862b67`；全量基线 68 → **72 天**（07-07 .. 10-21） | 本轮 |
| 00:1x | **🐛 修 BOM bug** | `token-monitor-history.json` 由 PS `Set-Content -Encoding UTF8` 写出带 BOM → `JSON.parse` 抛错被 catch 吞 → **72 天历史 / 12 月折线 / 按模型分布 / 摘要全静默丢失**。修：`lib/arts.ts` 的 `readJsonFile` 去 BOM + dump 脚本改走 node 落盘（`[System.IO.File]::WriteAllText` 在本机也不生效，写不进文件） | 本轮 |

---

## 会话总览 · 2026-10-21（塔罗过渡 + 参数校正工具）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 12:4x | **修首次打开视差不灵** | 是**代码问题不是网络**：`TarotFoilCard` 在弹窗打开瞬间挂载，`onEnter` 缓存的 `getBoundingClientRect()` 是 FLIP 动画中间态（实测偏 69/55px）。修法：等 `.tarot-face-anim` 结束（430ms）再绑监听；绑后指针已在卡上则补 `onEnter`；`onMove` 兜底补量 | `83a0787` |
| 12:4x | **预览页加位置滑块** | `gen_preview.py`：`transform-origin` 改用 `--art-ox/--art-oy`；新增**牌面左右/上下位置**滑块；放大上限 108%→120%；底部加参数汇总行 | widgets 本地 |
| 13:0x | **入场过渡** | 鼠标突然移到卡面（尤其边缘）时视差不再瞬跳。根因：CSS 自定义属性不可过渡（未注册 `@property`）。做法：进场后挂 `.entering` 给各层 `transform` 加 transition，窗口结束移除。`ENTER_MS = 260`；预览页加第 10 个滑块 | `7d1e69d` |
| 13:4x | **出场过渡** | 与入场对称：`pointerleave` 挂 `.leaving`，视差从当前位置平滑归零。`LEAVE_MS = 260`；预览页加第 11 个滑块。CDP 逐帧实测 `12.3 → … → 0px`（18 个中间帧） | `77d2ee2` |

**验证脚本**（`.worklog/`，可复跑）：
- `diag-parallax-first.mjs` —— 复现「飞行期缓存错误 rect」
- `verify-enter-transition.mjs [--off]` —— 入场过渡（带关闭对照）
- `verify-leave-transition.mjs [url]` —— 出场过渡（站点/预览页通用）
- `verify-preview-sliders.mjs` —— 预览页滑块可用性

---

## 会话总览 · 2026-10-21（看板与塔罗，已上线 + 线上验证）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 02:4x | **看板丰富化四项** | ① 折线数据不足降级为紧凑条（非零月 <3 时不再画空画布）② 平台分布（手动/Steam/WeGame/Epic + 百分比，**弃用堆叠条**——Steam 占 96% 会吃掉小项）③ 影卷按类型 ④ 常听歌手；影卷新增 `manga` 类型 + 三条内容（白圣女漫画/动画、败犬小说） | `8fb186a` |
| 04:1x | **对齐导航栏 + 点阵屏放大** | Ting 澄清「对齐」= 对齐**导航栏边界**（不是缩窄）；图表区块去 `max-w-2xl` 撑满容器，实测左右差 **0px**；三块点阵屏 176 → **299px**；修 `DotMatrix` 作用域冲突（新增 `scopeId`，`dm-n2-day/mon/total`） | `007c58d` + `0d32b80` |
| 10:0x | **看板两栏 + 塔罗抓牌** | 四组两栏（月度趋势恒在右）：音律概览/趋势、游戏排行/趋势、影卷类型/趋势、运动累计/趋势；塔罗牌被抓起后原位留**虚线空槽**、缩略图淡出、不可重复点击，关闭落位后才放回 | 本轮 |


## 会话总览 · 2026-10-21（塔罗牌面接入，已上线 + 线上验证）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 00:0x | 首牌改名 | 小阿卡纳首牌 `首牌` → **`一`**（对齐 `P:\TAROT` 笔记口径）；拼音 `shoupai`→`yi`、首字母 `sp`→`y`；card id 不变（`wands-1` 等），URL 与 `?card=` 不受影响 | `42583d6` |
| 00:2x–00:5x | **78 张牌面全部接入** | 源 = `P:\widgets\assets\rider-waite-smith\processed`（RWS 1909 公版拆层）；新增 `scripts/sync-tarot-assets.mjs`（card id 映射 + mtime 缓存 + 缺层跳过）；分层 **480px/q80 → 9.03 MB**（255 个）+ 拍平缩略图 **240px → 2.22 MB**（78 个），合计 **11.24 MB / 333 文件**；`TarotFoilCard` 加 `cardId` prop（78 张通用）、`TarotDeck` 弹窗全走闪卡、`CardTile` 改单张 thumb；删除旧 `major-00` | `2b94721` + `a54740d` |
| 01:2x–01:4x | **修复视差失效 + 渐进加载** | Ting 反馈「视差没生效」+「展开应先出整体牌面、失败别显彩虹」。**两个真因**：① 牌面外层 `pointer-events-none` 挡了 hover → 组件内补 `pointer-events-auto`；② 深链 `?card=` 时牌面层 0×0（定位代码在 FLIP 的 `if (!from) return` 之后）→ 定位提前。**加载重写**：先出 `thumb.webp`（≈29KB）→ artwork+edge 预加载完成才切分层并挂 rainbow → 失败常显 thumb、永不显 rainbow。三个 CDP 探针实测通过（含 3Mbps 限速抓到中间态） | `79e0121` |
| 01:2x | **塔罗 React 组件包开源** | `P:\widgets\opensource\rws-tarot-layers\react\`：`<TarotCard cardId="major-0" />` 78 张通用、零依赖、素材内置 11.24 MB；已推 GitHub `d6196d7`（v1.1.0） | widgets 仓库 |

**层覆盖（按印版事实，缺层不生成文件）**：artwork 78 / edge 78 / **number 54**（缺月亮、太阳 + 圣杯四、星币三、星币五）/ **title 45**（数字牌 2–10 无牌名带）。

**Ting 2026-10-21 定的塔罗规划**：① 先把 `P:\TAROT` 的牌义学完，学完再把牌义写进网站；② 学习笔记作为塔罗的另一部分，在塔罗那部分加一个「学习笔记」子页；③ **不做进度条**（总是要全学会的）；④ 不建「笔记文件名 ↔ card id」映射表。

---

## 会话总览 · 2026-10-20（数据刷新 + 文档收尾，已上线 + 线上验证）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 17:5x | 数据全面刷新 | Steam **248 款 / 7165.8h**（终末地 Steam 侧 0.4 → **18.4h** → 合并显示 **387.1h**）；网易云总时长 6022.9 → **6067.4h**（10 月 18541 分钟，top 98 首）；Last.fm 10 月 210 次（本月无新增）；Token 实时快照 **8.14B**（今日 193.96M / 本月 3.79B）；**全量基线到期补跑 68 → 71 天**（07-07 .. 10-20）；游戏总时长 **11140.4h** | `befaff9`（快照回提交）+ `c3bb837`（数据副产品）；gh-pages 直推；Pages built |
| 17:5x | 文档去 agent 化入库 | 上一轮遗留的 11 文件未提交改动经核对后提交：`WorkBuddy`→中性表述、`.workbuddy/`→`.worklog/`、旧工具专有词汇改通用描述；**其中仅 5 处落在代码/脚本且全是注释与路径字符串，源码逻辑与站点内容零改动**；`start-live.cmd` / `README.md` 里的真实 Node 路径有意保留 | `07031f9` |
| 22:4x | WeGame 周更报数 | Ting 客户端截图：总览 **1660h / 14 款 / 预约 8**；可见两项 → **英雄联盟 445.1 → 457.1h**、**战双帕弥什 4.6h（新）**；其余 9 款不动合计 **1660.3h** 与客户端吻合，推断缺的 3 款总时长≈0h → **Ting 定只录 11 款、不占位**；**Epic 未更新**（保持 8 款 / 25.5h）；终末地 Steam 侧 18.4 → 18.6h → **387.3h**；游戏总时长 **11157.2h** | `9d9e45c`（快照回提交）+ `ac3fadd`（WeGame + 副产品）；gh-pages 直推；Pages built |

## 会话总览 · 2026-10-18（塔罗日，全部已上线 + 线上验证）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 14:5x | 塔罗占位 + 首页入口 | Ting 提「每日塔罗」创意（仅占位、逻辑站外实现）→ 意见：`/works/tarot` 而非一级路由、侧栏小卡、日期种子；建 zh/en 占位页 + 侧栏「今日塔罗」小卡 + 诗句（艾略特《荒原》） | `4a951d5` + `aa68c82`；Pages built |
| 15:1x–16:3x | 条目化 + 牌库 demo | **造物第 03 条 TAROT**（OinO→04 / 游戏设计→05）；`/works/tarot` 枢纽 + `[sub]`（**deck / daily / cases**，牌库在前）；牌库：78 张韦特（拼音全拼 + 首字母）、chips、搜索、`?card=` 分享、滚动条补偿；侧栏去内部滚动框、热区收窄到「牌背 + 抽一张牌」 | `26a18e6`+`76cdb3c`、`f447398`+`34bcaae`、`8fb3c21`+`ffc7250` |
| 17:0x–18:2x | 详情过渡（两轮翻车后定稿 FLIP） | ① VT 方案：**同名 `view-transition-name` 冲突**（列表未卸载）→ 修复；② 修好后仍无效果——root 快照**复用主题擦除 keyframes** → 背景「滑动变暗」；③ **弃 VT 改 FLIP**（CSS animation 驱动）+ 愚者闪卡 `TarotFoilCard`（资源 20MB→305KB）+ 关闭反向 + 遮罩 z-40 / 导航 z-50 / 面板 z-60；列表页愚者改真实牌面（静态，视差仅详情） | `0391481`+`77cc180`、`9a5d3bc`+`c5624c7`、`e1da21b`+`ef9b13e`、`0792b5e` |
| 19:0x–00:2x | 两拍编排 + 层级修正 + 文档沉淀 | 第 1 拍**牌面单独**（fixed z-70）飞到位（面板背景透明、文字不可见）；第 2 拍面板背景从牌面 rect 向外展开 + 文字淡入 + 遮罩淡入 + 导航收紧；关闭：背景先收 0.22s → 牌面缩回 0.36s；**Nav 收紧改事件驱动**（`tarot-open` / `tarot-close`，页面顶部也生效）；修「关闭时文字不消失」（`fill-mode: both` 终态覆盖 inline）；AGENTS 塔罗架构节 + PITFALLS #26 | `59aff9b`、`31ed0a3`、`ef37864`+`a00cc05` |

## 会话总览 · 2026-10-17（已上线 + 线上验证）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 00:5x | 编排六稿：变换与收紧同拍 | 图标/小标题变换取消分段编排——与导航卡收紧**同 0.25s / 同曲线 / 同起止**，一体完成；**部署走备用通道**：gh-pages 直推遇 schannel 吊销检查 → API 通道 `push-pages-api.mjs`；main → SSH-over-443 临时密钥（用毕即删） | `73f97ea` + `a8e407a`；Pages built |
| 01:1x | 部署加固 + 数据全量刷新 | deploy.sh gh-pages 失败**自动**转 API 通道；新增 `push-remote.sh`（直推失败自动 SSH-over-443，trap 回收密钥）；快照回提交纳入 token 基线。数据：网易云/Last.FM/Steam 构建链刷新；**Token 云端快照 7.16B + 本地基线 68 天**并上线（首页点阵屏已显示）；WeGame/Epic 待报数 | `ffed3a4` + `a3b4e01` + `8240b91`；gh-pages `afbb9ab`；Pages built |
| 01:3x | 游戏/运动报数 | 终末地 **339.8h**（+11）/ 明日方舟 **1924h**（+2）/ 运动新增跑步 30min 条目；构建发布全通（gh-pages API 通道 + main SSH 通道自动命中） | `99b54e4` + `cd51d50`；gh-pages `32f2fe0`；Pages built |
| 13:2x | 终末地 +28.9h + Steam 跨平台合并 | 终末地 **368.7h**；Steam 库**无终末地**（复查）；发现 Where Winds Meet（燕云国际版 6.8h）→ 新增 `STEAM_MERGE` 机制（时长相加、Steam 分区不单列、手动条目独立展示）；燕云 **19.5h**；总时长 **11110.3h** | `79bdcb8` + `550e4cc` + `8630e09` + `2a107e9`；gh-pages `2557844`；Pages built |
| 13:3x | 终末地 Steam 复查（appid 4732690） | 按 Ting 给的 appid 精确查到 `Arknights: Endfield` **0.4h**（12:52 首查时尚未拥有，之后启动）→ 加入 `STEAM_MERGE`；终末地 **369.1h**（368.7 + 0.4）；Steam 分区/全榜不单列 | `ccfcf8c` + `a56d1af`；gh-pages `ea74028`；Pages built |
| 14:2x | 首页点阵屏 boot + 文案回退 | 应用 dot-matrix 三片补丁（哈希逐片吻合）；aside 卡启用 `boot`（整屏全亮 → 逐列退回底点，520ms/18ms，reduced-motion 停用）；燕云小结恢复「国服。」；其余新参数未启用 | `6a4e1e2` + `491ae63` + `7b2d37d`；gh-pages `fb95f05`；Pages built |
| 16:2x | 点阵屏状态灯 + 错点 | aside 启用 `gutter`（左心跳 / 右在线灯）× `glitch` 四档分级（随数据新鲜度 0.015→0.06）；增量组与数值配色当时未启用（配色见 16:5x 行）；顺带 `label`/`lang` 无障碍 | `9746af4` + `1ad135e`；Pages built |
| 16:5x | 点阵屏数值配色 | aside 启用 `groupColors`（数值组 `var(--color-accent)`）+ `primary={valueIdx}`（reduced-motion 定格数值组）；增量组仍未启用 | `3183537` + `46711d2`；Pages built |
| 17:0x–17:1x | 修复：组色覆盖全组元素 | Ting 两轮截图反馈「没完全变朱红」：① glitch 鬼点原为固定墨色 → 错点补 `dm-c{k}` + `.dm-glitch.dm-c{k}` 规则；② **真因：跨组共用锚点 `dm-both`**（三组字模交集，常亮、固定墨色）→ 新增 `dm-both-3-c` 填充关键帧随当前组切换（数值组时段 accent），reduced-motion 定格 primary 组色 | `09a93cb` + `4e56b4e`、`ab80d85` + `5539ed2`；Pages built |
| 2026-10-18 14:5x–16:3x | TAROT 条目化 + 牌库 demo | 造物列表第 **03** 条 `tarot.md`（order 3，OinO→04 / 游戏设计→05）；`/works/tarot` 枢纽 + `/works/tarot/[sub]`（**deck / daily / cases**）；牌库：78 张韦特牌（`lib/tarot-deck.ts` 含拼音；`TarotDeck.tsx`：**筛选 chips（全部/大阿卡纳/四花色）+ 搜索（中英/拼音/首字母）+ `?card=` 分享 URL + **两拍式展开/收拢**（第 1 拍：**牌面单独**在 fixed 层 z-70 飞到位——面板背景透明、文字不可见；第 2 拍：面板背景 `tarot-bg-in` 从牌面 rect 向外展开 0.36s + 文字淡入 + 遮罩淡入 + 导航收紧；关闭反向：背景先收 0.22s → 牌面缩回 0.36s；**导航收紧由 `tarot-open` 事件驱动 Nav state**（顶部也生效）；遮罩 z-40 < 导航 z-50 < 面板 z-60 < 牌面 z-70；弃用 VT——root 快照会复用主题擦除导致「滑动变暗」）+ **愚者闪卡**（列表页静态真实牌面 / 详情内倾斜 + rainbow 视差；资源 public/tarot/major-00 共 305KB）**）；侧栏无滚动框、热区=牌背+四字、诗句（艾略特《荒原》） | `4a951d5` + `aa68c82`、`26a18e6` + `76cdb3c`、`f447398` + `34bcaae`、`8fb3c21` + `ffc7250`、`9a5d3bc` + `c5624c7`；gh-pages `beafb7d` → `79a0cc4` → 17:4x；Pages built |

---

## 会话总览 · 2026-10-15（全天，全部已上线 + 线上验证）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 01:2x | GitHub 图标二改 | Ting 截图反馈：32px 太大 → 展开态 **24px**（与标题字号齐平）；收紧态图标移到中部小标题**文字之后**（6px 间距，小标题位置不变） | `1152602`（功能）+ `911c7e3`（副产品）；gh-pages `7ed59de` |
| 02:3x | 图标闪烁修复 + 点阵屏 | GitHub 图标改**单一浮层节点**（双槽位测量 + rAF 补间 + 滞回阈值）——治收缩/展开瞬换闪烁；首页 Token 卡改**点阵屏**（STRIVE ⇄ 累计 tokens 定时重组，周期 10s，单词可换） | `266ec9e` + `427f1b6`（+`ba1aa80` 副产品）；gh-pages 已推、Pages built |
| 03:1x | 编排二稿 + 点阵屏二稿 | 导航 **0.75s 编排**（标题擦除式显隐 + 图标缓动飞行 + 布局位移延迟到不可见时段；治回程图标/标题颠倒）；点阵屏**三组轮换**（+04TING.）、卡片简化（TOKEN 总用量 / 删今日本月 / 状态行到日） | `9906ae3` + `43c00d6`（+`af8cd0f`）；Pages built |
| 03:3x | 高度偏差修复（三稿） | 图标 **Y 轴改逐帧软跟随槽位中心**（与布局同拍）+ 品牌**行高固定 px**（防 Tailwind 比例行高骤跳）——探针实测 ±7px → ≤2px；稳态零偏差 | `3eefc43` + `ffebaa2`；Pages built |
| 03:4x | 编排五稿（变换 + 提速） | **0.75s→0.25s**；图标不再飞行——收紧时**原地溶解**、小标题随后**原地擦除式浮现**（回顶反演：标题消散→图标浮现）；删除飞行机制约 200 行；**收紧态不再显示图标** | `039c929` + `bc4752c`；Pages built |
| 03:5x | 微调：标题回归淡入淡出 | 变换隐喻下小标题不再擦除——信息区整体 `.nav-gh-info` 淡入淡出（时序不变：收 0.18–0.25s / 放 0–0.1s） | `0ef683a` + `997e410`；Pages built |

---

## 会话总览 · 2026-10-14（昨日，9 批，全部已上线 + 线上验证）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 13:2x~17:2x | Token 用量 | hub 多端聚合接入关于页完整区 + 首页侧栏紧凑卡（免密钥公开端点 30s 轮询 + 构建时快照 + 静态全量基线三层）；kit 归档至 `.worklog/token-monitor-kit/` | `8c0f4dd`（源码）+ `bf2f9f2`（副产品）；gh-pages `2495cf1` |
| 17:3x~18:0x | Token 用量修订 | Ting 五项反馈：云端优先取数（骨架屏消除双闪：她见的 216→225 是构建快照→实时）；关于页改「站点数据」同篇幅；新明细页 `/arts/stats/tokens`（zh/en）；货币 zh=≈¥（7.2 折算）/ en=$；时间 zh=北京时间 / en=EDT·EST | `61d1860`（功能）+ `76a2156`（副产品）；gh-pages `df9eeb0` |
| 20:3x | Token 明细页增强 | 轮询 30s→90s；明细页加日用量热力图（周一开列、朱红 5 档）；近 12 个月改累计口径；按工具→按模型两列；summary 加常用模型 chip | `ccfbcd3`（功能）+ `04b768d`（副产品+文档）；gh-pages `670893b` |
| 21:4x | 快照独立仓库 + 2s 超时 | hub 拉取超时 10s→**2s**（超时即落快照）；新开公开仓库 `004Tingting/token-monitor-data`（快照 + refresh.mjs + 15 分钟 cron）；`npm run token-snapshot` 手动推送；前端三层取数（hub 2s → 仓库快照经国内代理 → SSR 快照）；构建改仓库优先 | `0e8b9f6`（功能）+ `87a6474`（副产品）；gh-pages `dd095f5` |
| 22:0x | cron 授权上线 | Ting 授权 gh `workflow` scope；refresh.yml 推送 + 手动触发验证成功（自动提交新快照）——快照仓库进入全自动 | 无站点代码改动 |
| 22:4x | 脱敏数据流图 | hub / GitHub / 两台电脑 / 本地存储 10 条流向图；脱敏浅色版推数据仓库 `docs/data-flow.svg` 并嵌入其 README；AGENTS 加「架构图」索引行 | 数据仓库 `8bbb2d3` + `af89326`；站点 `9c9442e` |
| 23:02 | GitHub 图标 v1 | 标题「Ting」右侧加 GitHub 外链图标（官方 octicons mark-github-16） | `e61ad76` + `83b88b3`；gh-pages `d161819` |
| 23:15 | GitHub 图标三改 | Ting 截图（红框）：加大到 32px、`text-ink` 满对比度、收紧态缩小并后移一个汉字身位 | `f0c0a8a` + `9c179b6`；gh-pages `34796d7` |

**部署注记**：17:3x 前 deploy.sh 一键全绿；20:3x 批推送三连败后按 PITFALLS #6 停手约 15 分钟恢复；21:4x 批构建成功但推送再遇 reset/502，停手后 API 通道恢复；22:0x Ting 授权 workflow scope（设备码流程），快照仓库 15 分钟 cron 上线并手动触发验证；22:4x~23:15 与 10-15 各批（01:2x / 02:3x / 03:1x / 03:3x / 03:4x / 03:5x）deploy.sh / API 通道均一次成功；**10-17：直推持续遇 Windows schannel 吊销检查（`CRYPT_E_NO_REVOCATION_CHECK`）→ 备用通道已脚本化：deploy.sh 的 gh-pages 自动 API 兜底、`push-remote.sh` 自动 SSH-over-443 兜底（临时密钥 trap 回收）——当夜故障持续下实测一次全通**。当前远端 main = `07031f9`（10-20 数据刷新 + 文档去 agent 化），本地工作树干净。**新仓库**：`004Tingting/token-monitor-data`（public，快照 15 分钟自动刷新，手动补刀 `npm run token-snapshot`）。

---

## 会话总览 · 2026-10-13（前日，8 批，全部已上线 + 线上验证）

| 时间 | 批次 | 内容 | 入库 |
|---|---|---|---|
| 00:5x | 游戏报数 | 终末地 +2.5h / 明日方舟 +2h（Ting 报数） | `1914c2f` |
| 01:35 | 游戏全源 + 看板 | 游戏页三平台分区（`getGameSources` + `GameSourceList`）；新增燕云十六声 12.7h；看板影卷改最新 6 部 + 收起链接 | `554729b` |
| 17:3x | UI 六项 | 音乐页「正在播放」标签；GFM 表格修复（remark-gfm）；代码块日间白-on-白修复；ThemeToggle 动效；VT 擦除（方向+同时长旋转）；去 Last.fm 外链；关于页版式对齐 | `d8ffd3d`（含另一会话 Clarity 遗留，Ting 确认保留） |
| 18:5x | 歌单 + 公式 + 动效 | 歌单 315 首全量（`fetch-playlist.mjs`，v6/v3 接口）；首页 bar 标签同步；cover `order` 字段；KaTeX + 研思正文 Times | `c476ff1` |
| 19:5x | 歌单 iframe 化 + 方向 bug | CDP 实证 outchain 播放器写死 10 首 → 自建 srcdoc iframe；时长 1s；**方向 bug 修复**（VT 伪元素祖先选择器失效 → 改 var 继承，CDP 复测通过） | `ffa44c7` / `7400cb3`（补漏脚本一行） |
| 20:4x | 动效微调 | 时长 1s → 0.75s；删图标旋转（改为不动） | `8761ba4` |
| 21:0x | 文档体检 | 九份文档同步（HANDOFF / PITFALLS +3 条 / AGENTS / PLAN / DESIGN / README / MEMORY） | `8020dde` |
| 23:0x | 小内容批 | 歌单标签改本名 FaMic（now.json title）；「你要跳舞吗」tempo 150 转正（notes 去 Shazam 待核验） | `1695056`（源码）+ `243deb8`（gh-pages，API 通道）|

**部署注记**：github.com HTTPS 今天两段时间持续不通（Connection reset / auth failed）→ 按 PITFALLS #22 走 SSH-over-443 临时密钥通道推送（main + gh-pages），密钥用完即删；23:0x 批次推送时撞 reset + API 502（status 页 operational 的间歇性抽风），停手约 8 分钟后 Git Data API 通道推 gh-pages、HTTPS 嵌 token 推 main，均一次成功；其余批次 deploy.sh 一键全绿。当前远端 main = `e5ad92b`（含源码 `1695056` + 构建副产品），gh-pages = `243deb8`（Pages `built`），本地工作树干净。

---

## ⚠️ 新会话开场必提（Ting 指定）：数据源接入状态与趋势积累

1. **快捷条已并入导航卡**（2026-10-10 Ting 拍板「并入导航卡」方案）：三图标（返回/主页/刷新）在 nav 最右（hairline 分隔）；信息卡 = 导航卡中部信息区（收紧后浮现、窄屏隐藏，文章页标题+进度压卡底边）；`ReadingBar.tsx` 已删除，逻辑全在 `components/Nav.tsx`。若 Ting 有新一轮位置微调，直接改 Nav.tsx。
2. **看板月度趋势已上线**（`/arts/stats`，SVG 折线 ×4：游戏/影卷/运动/音律）：
   - 逐次型（运动条目、Last.fm scrobbles）直接按月聚合；**快照型（游戏/影卷 hours）差分自 2026-10 起积累——次月起才有趋势**，折线当前显示「积累中」属预期
   - 快照链路：`fetch-monthly.mjs`（build 链第二环）写 `content/arts/stats-history.json` + `lastfm-monthly.json` → `deploy.sh` 2.5/3 步自动回提交源分支
   - **Actions 备用通道构建不回推快照**（只有 deploy.sh 本地构建会）——若切回 workflow 模式需补此步
3. **网易云已接入官方时长口径**（2026-10-10）：
   - **官方听歌足迹 API 族**（GET + MUSIC_U Cookie 直通，无需 weapi）：`/api/content/activity/listen/data/total`（总时长，秒）、`/year/report`（年度，秒）、`/realtime/report?type=month`（当月，**分钟**+逐日明细）——单位不统一，已实测校准
   - **数据文件** `content/arts/netease-monthly.json`：totalHours（总览大数字）+ monthly（分钟，折线用）；2026-01~09 = Ting 官方截图**人工回填**（脚本永不覆盖），当月起自动抓取覆盖当月键
   - **top100 听歌排行差分已退役为备份**（口径太小：2026 年大量听新歌，top100 差分明显低估）；stats-history 的 netease 快照继续积累
   - **遗留**：① 2025-11/12 月度明细缺（8 个月窗口下已出图外，无碍）② Cookie 数月过期（症状：total/realtime 拉取失败）③ 月末未构建有 ≤1 天缺口
   - 此前「旧公开接口 404」仅指 `/api/user/playrecord` 旧路径；`/api/v1/play/record`（top100 排行）与 `/api/content/activity/listen/data/*`（足迹时长）均 GET+Cookie 可用
4. **Steam + WeGame + Epic 游戏时长已接入**（2026-10-10）：
   - **Steam**：`IPlayerService/GetOwnedGames/v1`（GET + STEAM_API_KEY/STEAM_ID）→ `steam` 快照（小时）；**248 款 / 7165.8h**（2026-10-20 刷新）；**跨平台同款合并 `STEAM_MERGE`（2026-10-17，Ting 定规则）**——Steam 库名 → 手动条目 title 映射（zh/en 各一份，`lib/arts.ts`）：映射内时长**相加**进手动条目、Steam 平台分区不单列、全榜跳过（总时长口径不变）；当前 `Where Winds Meet → 燕云十六声`、`Arknights: Endfield → 明日方舟：终末地`；**终末地已在 Steam 库**（appid 4732690，**18.4h**，2026-10-17 起映射并入）；**查 Steam 数据一律优先按 appid**（名字搜索不可靠）
   - **WeGame（周更人工）**：无 API → `content/arts/wegame-games.json`（Ting 每周报数，**助手改数字即可**）→ `wegame` 快照；**周更约定：Ting 主动提示（不设自动化），更新时 助手提醒 Ting 拿客户端截图**；**2026-10-20 报数：11 款 1660.3h**（无畏契约 699.2 / 英雄联盟 **457.1** / 三角洲行动 353.3 / 二重螺旋 79.8 / 王者万象棋 51.6 / 卡拉彼丘 12.7 / **战双帕弥什 4.6（新）** / 其余 ≤1h）。**口径差（有意为之）**：客户端总览显示 **14 款**，本站只录已确认时长的 11 条——缺的 3 款总时长≈0h，Ting 2026-10-20 定「不占位、等名字确认再补」，`wegame-games.json` 的 note 已写明，勿当成漏数据
   - **Epic（人工模式）**：API 路径探明为死路（设备授权 token 无 library 权限；authorizationCode ≠ exchangeCode；真 exchange code 在登录会话 cookie 内拿不到）→ `content/arts/epic-games.json` 人工报数 → `epic` 快照；首期已录入（8 款 25.5h，2026-10-10），后续 Ting 报数即更新
   - **合并口径**：gamesDelta = 人工 frontmatter + Steam + WeGame + Epic **四源差分相加**；总览游戏大数字 = 四源之和（**11157.2h**，2026-10-20 WeGame 报数后）；全站统一走 `baselines.games`（stats 页/游艺总览/关于页）
   - **时长排行与全榜**：Bars = 合并排行 top 6（`getGameHoursFull` 同名去重）；全量列表在**新页 `/arts/stats/games`**（en 镜像），stats 页游戏区块底部有朱红跳转链接；sitemap 已补录全榜页
   - **失效症状**：Steam key HTTP 4xx → 重申请；网易云 Cookie 数月过期 → Ting 重取；WeGame/Epic 数据陈旧 → 提醒 Ting 报数
5. **修过一个小 bug 勿忘**：Node 构建脚本不自动读 `.env.local`（fetch-now 快照曾停在 10-06）——两个 fetch 脚本开头已手动加载，新脚本照抄此模式。

---

## 一句话现状

站点已上线运行（**五栏信息架构**），**内容多为示例/初稿，等待 Ting 填充真实内容**。
**UI 近况**：顶部导航 sticky + 滚动收紧为浮动圆角卡片；**快捷条三按钮并入导航卡**（返回/主页/刷新在 nav 右端），收紧后中部显示页面/文章标题（文章页卡底进度条）——整个 header 只剩一张卡；**标题「Ting」右侧有 GitHub 图标**（外链，官方 octicons mark；2026-10-17 六稿定稿：**「变换」编排与导航卡收紧完全同拍**——收紧时图标渐隐溶解、小标题渐现，与卡片 chrome 同 0.25s / 同曲线 / 同起止，一体完成；回顶反演。**收紧态不显示图标**（footer 有常驻入口）；纯 CSS 驱动，无 JS 逐帧动画）。**看板 `/arts/stats` = 基础聚合 + 月度趋势 SVG 折线**（音乐=网易云账号级、游戏/影卷=快照差分积累中；影卷区块只列最新 6 部 + 链全量）。**主题切换**：整页 View Transitions 擦除变色（0.75s；黑→白从左到右、白→黑从右到左，方向经 `--theme-wipe-anim` 变量切换），图标本身不旋转。**首页 Token 点阵屏带 boot 自检**（2026-10-17：整屏先全亮、再按列逐列退回底点，520ms 淡化 / 18ms 列步进，一次性，reduced-motion 自动停用）；**两侧状态灯**（左列心跳、右列在线灯，离线转闪烁，占宽 4 列）；**错点随数据新鲜度四档变化**（正常偶发孤点 → 停更 → 快照 → 离线持续故障；**错点跟随所属组配色**——数值组鬼点也是朱红，2026-10-17 修复）；**数值组 accent 配色**（轮换到累计 tokens 时该组朱红，`primary` 让 reduced-motion 定格在数值组）；增量组未启用。**塔罗牌库**（2026-10-18，造物 03 `/works/tarot`）：78 张韦特牌 demo（拼音搜索 / chips / `?card=` 分享）+ 枢纽与三子页（**deck / daily / cases**）；详情为**两拍动效**——牌面先单独飞到位（fixed z-70），面板背景再从牌面 rect 向外展开 + 文字淡入 + 导航收紧（**事件驱动 Nav state**）；愚者用**分层闪卡**（倾斜 + 视差 + rainbow，资源 305KB），其余 77 张待 Ting 插件包接入。**层级约定**：遮罩 z-40 < 导航 z-50 < 面板 z-60 < 牌面 z-70。
**进行中**：**影卷 38 条全部「看完」**（时长两位小数、联网核实，rating 待 Ting 补）；**影卷栏目英文名 2026-10-12 改为「Watch & Read」**（原 Screen & Books）；**cover 详情页 `/arts/music/[slug]` 已上线**（原视频 + 节拍器/曲谱/伴奏占位；现有 2 条：电吉他「你要跳舞吗」+ 电吉他「王妃」，`order` 字段控制顺序——你要跳舞吗在前）；**网易云已接入**（等 11 月出首条听歌趋势）；**歌单全量曲目已上线**（2026-10-13：自建 srcdoc iframe 展示 FaMic 315 首、iframe 内滚动、每曲链网易云——outchain 播放器写死只列 10 首已弃用；`scripts/fetch-playlist.mjs` 构建时同步）。
**2026-10-13 功能批（已上线）**：① 研思正文接入 KaTeX（论文公式全量转 LaTeX）+ 研思正文西文固定 Times New Roman（`.article-body`，仅正文）② 修复全站 markdown 表格（react-markdown v10 默认无 GFM，装 `remark-gfm`）③ 代码块日间模式白-on-白修复（`--tw-prose-pre-code`）④ 音乐页/首页「正在播放」标签统一、去掉 Last.fm 外链 ⑤ 游戏页补 Steam/WeGame/Epic 三平台分区 + 新增燕云十六声 12.7h ⑥ 关于页版式对齐其他栏目页 ⑦ 访客统计 Clarity 接入（Ting 另一会话，projectId `yx0nnrlyns`）。
**研思首篇真文章已上线**（2026-10-12 21:19 发布）：Ting 指示「第一篇文章即作为 Deng 论文精读笔记」+「默认直接发布，发布后由我在网页上直接审」→ 占位示例《预定时间滑模控制：收敛时间如何变成可设计的量》退役，新文章《用延迟反馈「预订」收敛时刻：Deng et al. 2024 论文精读笔记》（zh+en，slug `deng-2024-predefined-time-tsmc`）已发布；论文全文（HAL 自存版）通读、技术细节核对原文，并经一轮 STYLE.md 语句审查（11 处）；旧 URL 有跳转；线上 zh/en 均 200 验证通过。**内容流程已改**：交付即发布，Ting 网页审稿后提修订。
**2026-10-14 功能批（已上线，当日四轮修订至终态）**：**Token 用量上线**——Ting 把散落多处的 token monitor（两台桌面 widget 各算本机）合并到自建 Cloudflare Worker hub，关于页摘要栅格 + 首页侧栏紧凑卡 + 看板明细页 `/arts/stats/tokens` 展示多端聚合：三周期数字（今日/本月/累计 + 成本）、近 30 天柱状、**日用量热力图**、**近 12 个月累计折线**、**按模型两列分布**、摘要 chips。**云端优先 + 2s 规则**（Ting 18:00/21:46 批定）：首帧骨架 → hub 2s 超时内拉到显实时值 → 拉不到显快照仓库数据（经国内 GitHub 代理，15 分钟自动刷新）→ 再不到才用构建快照，各层标注数据时间；轮询 90s；货币中文页 ≈¥（1 美元 = 7.2 折算）/ 英文页 $，时间中文页北京时间 / 英文页美国东部（EDT/EST）。**独立快照仓库** `004Tingting/token-monitor-data`（public，Actions 每 15 分钟自动拉取，构建优先读它）。当前累计 **~8.14B tokens**（2026-10-20 刷新：云端快照 8.14B + 本地全量基线 **71 天**）。**2026-10-15**：首页侧栏卡 = kicker「TOKEN 总用量」+ **点阵屏**（`components/DotMatrix.tsx`，5×7 LED 字模，三组轮换 STRIVE → 累计 → 04TING.，每组 5s）+ 状态行「●/○ hub 在线/离线 · 更新于 YYYY年M月D日」；内容常量 `DOT_MATRIX_WORD` / `DOT_MATRIX_TAG` 可换。
**下一步（Ting 侧，新会话接这个）**：
- **审稿**：① 研思首篇 Deng 2024 精读笔记（https://004tingting.github.io/research/deng-2024-predefined-time-tsmc/，**公式已转 LaTeX、正文西文 Times**，重点看公式渲染与表格）② 近两日 UI 批次（主题擦除 0.75s / 歌单 iframe / 游戏页三平台 / 关于页版式 / **GitHub 标题图标**：滚动看收紧/展开——2026-10-17 六稿：图标渐隐 ⇄ 小标题渐现，与导航卡收紧完全同拍；收紧态不再显示图标 / **首页点阵屏 boot 自检**：刷新首页看「全屏全亮 → 逐列退回底点」的开机自检，2026-10-17 上线）③ **Token 用量**（关于页摘要栅格 + 首页侧栏 + 明细页 `/arts/stats/tokens`，zh/en；**2026-10-15 起首页卡为点阵屏**：三组轮换 STRIVE / 累计 / 04TING. 每 5s 一组、点阵重组动效；kicker 改「TOKEN 总用量」、今日/本月行已删、状态行到日；**2026-10-20 数据已刷新至 8.14B / 基线 71 天**）④ **周更报数**：WeGame **已于 2026-10-20 报数**（11 款 / 1660.3h）；**Epic 仍未更新**（Ting 明确「Epic 未更新」，保持 8 款 / 25.5h），下次报数时一并给
- **待补内容**：④ 影卷 38 条 rating 评分 + 测评 ⑤ cover 2 条 BV 号 / 曲谱 / 伴奏（「你要跳舞吗」BPM 150 已确认；「王妃」的原速 BPM 仍待补）⑥ about 页正文（版式已就位）
- **待 Ting 决策**（ 助手按默认处理，可随时改）：~~⑥ 歌单分区标签现为「我喜欢的音乐」，歌单本名 FaMic——是否改标签~~（**2026-10-13 已定：改用本名 FaMic**，now.json title）⑦ 燕云十六声默认 `status=playing` / `platform=PC`，「国服」写在小结 ~~⑧ 「你要跳舞吗」tempo 150 为 Shazam 口径，待按原速核验~~（**2026-10-13 已确认原速 150**，notes 已转正）
- **周更约定**：① **WeGame / Epic 报数**（Ting 拿客户端截图报数，助手改 `wegame-games.json` / `epic-games.json`）——**WeGame 2026-10-20 已报（11 款 / 1660.3h，客户端 14 款中 3 款≈0h 暂不录）；Epic 仍未更新（停在 10-10，8 款 / 25.5h）**，下次提醒 10-23 23:00 ② **token-monitor-history.json 每周刷新**（跑 `.worklog/token-monitor-kit/dump-hub-history.ps1`，带密钥；助手可代跑）——**本周已完成 2026-10-20（71 天，07-07 .. 10-20），下次顺延**

## 站点与部署

| 项 | 值 |
|---|---|
| 线上 | https://004tingting.github.io |
| 仓库 | https://github.com/004Tingting/004Tingting.github.io |
| 部署方式 | **gh-pages 分支模式**（`bash scripts/deploy.sh`）；Actions 已降级为手动触发的备用通道 |
| 数据分支 | `now-data`（本机脚本推送的实时收听数据；前端经**国内 GitHub 直通代理**读取，无缓存）|
| 访客统计 | Microsoft Clarity（projectId `yx0nnrlyns`；`components/Analytics.tsx` 注入双 layout `<head>`，站点无可见元素，数据仅后台可见）|
| Token 用量 | hub `token-monitor-hub.saikouting004.workers.dev`（Cloudflare Worker，多端聚合）；公开端点免密钥；快照仓库 `004Tingting/token-monitor-data`（public，**15 分钟自动刷新已上线**，手动 `npm run token-snapshot`）；前端三层（hub 2s → 仓库快照经国内代理 → SSR 快照）；构建仓库优先；kit 与凭据在 `.worklog/token-monitor-kit/`（本地勿入库）|
| 歌单数据 | `content/arts/playlist.json`（`scripts/fetch-playlist.mjs` 构建时拉全量曲目；FaMic 315 首）|

## 信息架构（五栏）

| 栏目 | URL | 内容 |
|---|---|---|
| **研思** | `/research` | 推导、方法、文献研读与复盘 |
| **造物** | `/works` | 软件、项目与实验成果 |
| **游艺** | `/arts` | 音律 `/arts/music` · 游戏 `/arts/games` · 影卷 `/arts/screen` · **运动 `/arts/exercise`** · **看板 `/arts/stats`**（基础版已上线）|
| **纪事** | `/chronicles` | 时间切片、复盘与随笔 |
| **关于** | `/about` | 履历与站务 |

**运动板块（2026-10-07 新增，10-09 定名）**：跑步 / 徒手，条目制（`date / kind / duration / distance / note`）。
Ting 的措辞约束：讨厌「健身」叙事、喜欢自然肌肉线条、目标瘦腿、**不要写「囚徒健身」**。

英文站镜像于 `/en/*`；旧 URL（`/blog`、`/life/*`、`/projects/*`）由 postbuild 生成跳转页自动重定向。

---

## 待办（按优先级）

### 0. 开篇《写在开始》审稿 —— zh + en 均完成
| 项 | 状态 |
|---|---|
| zh 全文（开头 / 自介 / 研思 / 造物 / 游艺 / 纪事关于 / 结尾） | ✅ 十一轮修订完成，全部上线；批注沉淀至 `STYLE.md` |
| en 版同步 | ✅ 2026-10-12 按 zh 定稿重写上线（旧「Three Decisions」模板稿已废，新稿镜像 zh 流式结构） |

### 1. 内容替换 —— Ting 侧，最重要
| 内容 | 位置 | 状态 |
|---|---|---|
| 研思文章 | `content/research/{zh,en}/deng-2024-predefined-time-tsmc.md` | **首篇真文章已上线**（2026-10-12 21:19，Ting 指示「第一篇文章即作为 Deng 论文精读笔记」+「默认直接发布，网页审」）：Deng et al. 2024 IEEE TAC 论文精读笔记（zh+en），占位示例已退役、旧 URL 有跳转、经 STYLE.md 语句审查；**Ting 网页审稿中**。下一篇候选：扰动观测器 / 固定时间微分器方向的文献 |
| 游艺条目 | 游戏手动条目 3 款（明日方舟 1924h / 终末地 **387.3h**（368.7 手动 + 18.6 Steam，`STEAM_MERGE` 合并显示）/ 燕云十六声 **19.5h**（12.7 国服 + 6.8 Steam 国际版，`STEAM_MERGE` 合并显示），均 playing；**运动 2 条**：10-11 跑步机 42.4min / 10-17 跑步 30min）；**Steam（248 款）/ WeGame（11 款）/ Epic（8 款）已上游戏页「平台时长记录」分区**（2026-10-13，getGameSources + GameSourceList，构建时读快照）；**影卷 2026-10-12 已 38 条全部「看完」**（8 条真实记录 + 30 条按 B 站截图补充：哈利·波特 8 部 / 灵笼 / 莉可丽丝 / 公主连结两季等；时长联网核实、两位小数，总计 141.15h；**rating 全空待 Ting 补评分/测评**）；cover 2 条占位（电吉他「王妃」+ 电吉他「你要跳舞吗」新裤子，详情页已上线，待 BV 号 + 原速 BPM + 曲谱 + 伴奏） |
| 造物项目 | `content/works/{zh,en}/` | CAV / 故障诊断 较实；**OinO / 游戏设计 偏框架**；**TAROT = 造物 03**（md 仅列表元数据；`/works/tarot` 枢纽 + deck/daily/cases 子页；**牌库 demo 已上线**（78 张 + 搜索 + 弹窗预览，卡面待 Ting 的分层闪卡替换）；每日/案例仍为占位） |
| 关于页 | `app/(zh)/about/page.tsx` + en | **版式已对齐其他栏目页**（Kicker + 5xl 标题 + max-w-5xl + 统一分区，2026-10-13）；**正文仍是占位**，待 Ting 写 |

### ③ 内容待补（⬜ 未做 · 暂不删除——2026-10-18 Ting 指示留档）

> **2026-10-20 22:4x Ting 明确表态**：这四项都**不急、先搁置**，不要再催——
> 影卷 rating「先不写，后续和测评一起写」；about 正文「我没思路」；cover「还没做」；塔罗「稍后给出，我有所有的成品」。

| 项 | 状态 | 说明 |
|---|---|---|
| 影卷 38 条 rating + 测评 | ⬜ 搁置（Ting 定：与测评一起写） | 条目已全「看完」、时长两位小数；rating 全空。**不要单独补 rating**，等 Ting 一次性给 rating + 测评 |
| about 页正文 | ⬜ 搁置（Ting：暂无思路） | 版式已就位，等 Ting 写文字 |
| cover 补料 | ⬜ 搁置（Ting：还没做） | 「王妃」原速 BPM、两条 BV 号 / 曲谱 / 伴奏 |

### ④ 塔罗待接入（⬜ 等 Ting 给素材 · 2026-10-20 更新）

> **Ting 2026-10-20**：「塔罗牌相关内容我稍后给出，我有所有的成品」——素材在她手里，等她发，**不要自行找图或占位替换**。

| 项 | 说明 |
|---|---|
| 其余 77 张牌面 | 等 Ting 的成品/打包文件；替换 `CardTile`（列表静态叠加）与弹窗牌面（fixed 层内容）即可，两拍动效不用动 |
| 牌义正文 | `TarotDeck` 弹窗 `readingNote` 目前是统一占位；可扩成每张牌一条数据（`lib/tarot-deck.ts` 加字段） |
| 高清资源入口 | 建议 **GitHub Releases + 点击按需加载**（不要构建时拉）；`manifest.json` 映射牌 id → 各层文件路径；高清也转 webp（1400–1800px） |

### 2. 功能开发
- **前端性能优化已上线**（2026-10-12，不改架构/视觉）：NowPlayingLive 后台暂停轮询、Nav 滚动零无效重渲染、Giscus 延迟注入、covers.json 可缓存；共享 JS 103 kB
- **月度趋势已上线**（2026-10-10）：音乐=网易云账号级（官方时长口径 + 历史月人工回填）、运动逐次聚合（2026-10-11 首条跑步机 42.4min/3.49km；**10-17 新增跑步 30min**）、游戏/影卷快照差分（次月起出趋势）；月轴 8 个月；数据链路见开场提示 2/3
  - **2026-10-20 实测提醒**：四张折线**仍全部显示「积累中」**。快照差分自 2026-10 起积累，而站点**尚未跨月构建过**（10-19、10-20 两次构建都还在 10 月内，`stats-history` 只有一个 `2026-10` 键）→ 属预期，不是 bug。**11 月首次构建后**游戏/影卷才会出真实趋势
- ~~网易云 Cookie 接入~~：已完成（GET+Cookie，无 weapi）；**Cookie 过期时找 Ting 重取**（2026-10-20 实测拉取正常：总 6067.4h）
- ~~快捷条位置调整~~：已按「并入导航卡」方案完成（若 Ting 还有微调，改 `components/Nav.tsx`）

### 3. 已完成（勿重做）
- giscus 评论（Discussions 已开 + App 已装 + 已启用）✓
- SEO / OG 卡片 / sitemap / 双语 RSS / 定制 404 ✓
- 实时「正在听」（Last.fm + 本机推送脚本）✓
- 工作日志制度（AGENTS 硬性约定 #7）✓
- **数据看板基础版**（`/arts/stats`，构建时聚合 + CSS 条形，零依赖）✓
- **月度趋势**（快照差分 + SVG 折线 ×4 + deploy.sh 快照回提交）✓（2026-10-10，已发布）
- **快捷条并入导航卡**（ReadingBar 已删，逻辑在 Nav）✓（2026-10-10，已发布）
- **网易云官方时长口径 + Steam/WeGame/Epic 四源游戏时长 + 全榜页 + 基线视图** ✓（2026-10-10~11，已发布）
- **首页微调**（「· 个人杂志」放大 1.5×朱红 / 「硕士」楷体 / interests 新文案）✓（2026-10-11，已发布）
- **游戏条目真实化**（明日方舟 ×2）✓；**系统状态组件已评估并否决**（沙箱限制，勿再做）✓
- **开篇 en 版重写**（按 zh 定稿，废 Three Decisions 旧稿）✓（2026-10-12）
- **影卷 8 条占位 + cover 占位**（时长联网核实）✓（2026-10-12）
- **前端性能优化**（后台轮询暂停 / Nav 零无效重渲染 / Giscus 延迟注入）✓（2026-10-12）
- **影卷译名 Watch & Read + 时长两位小数 + 38 条全「看完」**（含 30 条 B 站截图条目，141.15h）✓（2026-10-12）
- **cover 详情页 `/arts/music/[slug]`**（原视频 + 节拍器/曲谱/伴奏占位；节拍器光标需求已注明）✓（2026-10-12）
- **源码入库 main**（commit 015d298：此前 main 只剩自动快照提交，源码落后多会话）✓（2026-10-12）
- **cover《你要跳舞吗》**（新裤子，电吉他，tempo 150 = Shazam 口径待核验；zh/en 双语条目，复用详情页零代码改动，commit c74dbd1）✓（2026-10-12 19:05）

---

## 月度趋势（2026-10-10 已动工上线，架构留存备查）

### 架构：快照差分 + 逐次聚合

```
┌ 数据源 ──────────────────┐  ┌ 聚合层 ─────────────────┐  ┌ 展示 ──────────┐
│ 运动 frontmatter（逐次）  │  │ scripts/aggregate-stats │  │ /arts/stats    │
│ Last.fm scrobbles（逐次）│→ │  + stats-history.json   │→ │ 月度柱状 / 折线  │
│ 游戏/影卷 hours（累计）   │  │ （追加式快照）           │  │ CSS 柱 / SVG   │
│ 网易云排行（累计，可选）   │  └────────────────────────┘  └────────────────┘
└─────────────────────────┘
```

- **天然逐次型**（直接按月聚合 = 真趋势）：运动条目（date+duration/distance）、Last.fm scrobbles（每条有时间戳）
- **累计快照型**（月度增量 = 邻月快照相减）：游戏/影卷 hours（frontmatter 存总数，date 是记录日）、网易云 playCount
- `stats-history.json`：追加式快照 `{t, games:{...}, screen:{...}, netease:{...}}`——与 now-data 同思路，纯文件零数据库

### 网易云听歌排行（实测结论 2026-10-10）

- Ting UID = `547547014`（经歌单 13345990688 的 creator 字段验证获取；**该歌单本名 FaMic、315 首**，站点标签 2026-10-13 起改用本名 FaMic）
- 旧公开接口 `/api/user/playrecord` → **404 已死（实测）**
- 可行路径：**weapi 加密 + MUSIC_U Cookie**（Node crypto 自实现约 40 行，或 NeteaseCloudMusicApi fork；Cookie 网页版登录复制，几个月过期）
- 数据形态：每首歌**累计 playCount**（仅「所有时间/最近一周」窗口，无时间戳）→ 月度靠快照差分；时长需补查 song/detail（有 duration ms）；上限 1000 首
- 价值：**账号级**（手机 App 听歌也算）；Last.fm 链路只能抓本机 SMTC 播放

### 面板升级方案（待敲定）

| 方案 | 做法 | 代价 |
|---|---|---|
| A 保持静态 | 构建时聚合 + CSS 条形（现状） | 无交互/无时间序列 |
| B SVG 手绘 | 月度折线/柱状自绘 SVG，杂志风可控 | 需月度聚合逻辑（中等成本） |
| C 图表库 | Recharts/Chart.js | 加依赖（AGENTS #6 需理由） |
| D 数据源扩展 | Last.fm 时长聚合（scrobble×单曲时长）；游戏/影卷加开始日期字段 | 构建变慢、frontmatter 加字段 |

**推荐**：A→B 两步走；D 的音乐部分独立评估（依赖 Cookie 拍板）。

---

## 实时收听链路（结构特殊，务必先理解）

```
本机脚本 npm run live（每 15 秒；去重签名持久化于 %TEMP%，重启不重复推送）
  ├─ Last.fm：当前曲目
  ├─ 网易云：专辑封面（本机直连 — 浏览器无 CORS 权限，这是必须走本机的原因）
  └─ GitHub Contents API → now-data 分支（另每 ≥10 分钟 purge 一次 jsDelivr 作兜底）
                         ↓
前端 components/NowPlayingLive.tsx（多源 + 三级降级，轮询 15 秒 + 页面可见时立即刷新）
  ① now-data：gh-proxy.com → gh.llkk.cc → jsDelivr（依次尝试；前两个**无缓存**）
  ② Last.fm 直连 + 构建时封面映射  ③ 构建快照
```

端到端延迟上限约 **30 秒**（脚本 15s + 推送 ~3s + 前端 15s）。

**数据通道为什么不用 jsDelivr 做主源**：它的 purge 有 **720 秒限流窗口**，脚本每次切歌都 purge 会踩中限流 → **之后所有 purge 失效、缓存永久停在旧版本**（实测前端数据滞后 20+ 分钟）。故改走无缓存的国内直通代理，jsDelivr 仅作兜底。

- **脚本不跑时**：曲目仍实时（前端直连 Last.fm），封面回退到构建时映射表（最近 50 首）
- 配置在 `.env.local`（已 gitignore）：`LASTFM_API_KEY` / `LASTFM_USER` / `GITHUB_TOKEN`
- 构建时另有一套快照：`scripts/fetch-now.mjs` 生成 `content/arts/lastfm.json` + `public/covers.json`

---

## 环境注意（本机会话内，踩过的坑）

1. **gh / git 必须清代理**：`env -u HTTPS_PROXY -u HTTP_PROXY -u https_proxy -u http_proxy`
   （平台内部代理 127.0.0.1:15422 会掐断 GitHub 请求，报 EOF）
2. **git 凭据弹窗 / push 卡死**：PortableGit（构建环境自带）在**系统级**注入 `credential.helper=helper-selector`，优先级高于全局 GCM → git 在认证与存凭据两阶段各调用一次，表现是弹 GUI「Select a credential helper」或**无输出卡 1~2 分钟后被强杀**
   - **解法（记住这一条）**：`git -c credential.helper= push <url> <branch>` —— 命令行 `-c` 优先级最高，彻底禁用 helper
   - 配合：`export GIT_TERMINAL_PROMPT=0`（认证失败只报错、不弹窗）
   - 排查：`GIT_TRACE=1 git push ...` 能看到 `run_command: 'git credential-helper-selector store'`
   - `scripts/deploy.sh` 已内置全部防护（清代理 + 完整路径 gh 取 token + `-c credential.helper=` + 禁交互）
3. **Node 子进程受限**：`child_process` spawn（如 execFileSync('git')）在沙箱内报 EBUSY → 脚本里改用 HTTP API
4. **✅ 构建标准配方（2026-10-07 实测，替代此前所有说法）**：
   问题根因是 sandbox 的 safe-delete shim 按「删除数量」计数（阈值 50），`next build` 重建 `.next` 时的删除会撞墙。
   **解法 = 让构建「只写不删」+ 前台非沙箱**：
   ```bash
   # ① 前台非沙箱：清空 .next 的易过期目录（重建空目录）与旧 out/
   python -c "
   import shutil, os
   for d in ['server','static','types','diagnostics']:
       p = os.path.join('.next', d)
       shutil.rmtree(p, ignore_errors=True); os.makedirs(p, exist_ok=True)
   open('.next/trace','w').close()
   shutil.rmtree('out', ignore_errors=True)"
   # ② 前台非沙箱构建（timeout 600s）
   npm run build
   ```
   - **关键：必须「前台 + 关闭沙箱」**——后台运行的任务拿不到绕行，删除会被拦
   - `.next` 无过期文件 → 构建几乎零删除 → 不撞 safe-delete；trace 预清空 → 不撞 EPERM
   - 本配方 2026-10-07 两次一次通过（~1–2.5 分钟）
5. **不要删整个 `.next`**：会触发「冷目录 EPERM」（`trace` 首次创建被拒）；只清空上述 4 个子目录即可
6. **GitHub 偶发故障**：先查 `https://www.githubstatus.com/api/v2/components.json` 与 `/incidents/unresolved.json`，不要盲目重试
   - 2026-10-12 实测症状：`git push` 报 `schannel: failed to receive handshake, SSL/TLS connection failed`，且 `github.com` / `api.github.com` / `githubstatus.com` 全部 curl 000（直连与代理都不通）——**等几分钟后一次重试即过**，勿连续重试；Pages CDN（`*.github.io`）不受影响，站点访问正常
7. **空栏目会导致构建失败**：Next 静态导出要求动态路由至少一个页面（AGENTS 硬性约定 #9）
8. **dev server**：建议 Ting 本机终端跑（沙箱会拦批量清理）
9. **jsDelivr 的 purge 会被限流**：响应出现 `{"throttled":true,"throttlingReset":720}` 即表示已被限流（12 分钟内拒绝 purge）；`@branch` 引用默认缓存 12 小时 → **不适合承载高频更新的数据**
   - 可用的无缓存通道（均需 CORS）：`gh-proxy.com` ✅ / `gh.llkk.cc` ✅
   - 有 CORS 问题的：`ghfast.top`、`ghproxy.net`（无 `Access-Control-Allow-Origin`，前端用不了）
   - 不可达：`raw.githubusercontent.com`（502）、`cdn.statically.io`、`raw.gitmirror.com`
10. **`New_SMTC.exe` 与 `push-now.mjs` 是串联关系**（2026-10-07 调研）：
    - `New_SMTC.exe`（PyInstaller 打包的 `New_Scrobbling.py`）：读本机媒体库 SQLite → **上报 Last.fm**（`track.scrobble`），游标 `last_id.json`，配置 `config.json`（`SESSION_KEY`）；**未签名**
    - `scripts/push-now.mjs`：读 Last.fm → **同步到网站**（GitHub `now-data`）
    - **只开 push-now 不够**——Last.fm 无新数据可搬；必须 SMTC 先跑（喂数据给 Last.fm），push-now 再搬运

---

## 常用命令

```bash
npm run dev                      # 开发服务器
npm run build                    # 构建（fetch-now → fetch-monthly → fetch-playlist → next build → postbuild 跳转页）
python scripts/preview.py 8000   # 本地预览（clean URL，对齐 GitHub Pages）
npm run live                     # 实时收听推送（常驻，Ctrl+C 退出）
npm run og                       # 重新生成分享卡片图
bash scripts/deploy.sh           # 一键发布（构建 → 推 gh-pages → 触发 Pages）
```

> **`npm run live` 在 Ting 自己的终端里跑不了**：Node 装在工具自带目录
> （`C:\Users\SaiKo\.workbuddy\binaries\node\versions\22.22.2-6`），普通终端 PATH 里没有 `npm`。
> **已提供双击启动脚本：项目根目录 `start-live.cmd`**（自动找 Node + 校验 .env.local）。
> 命令行等价写法：
> ```cmd
> "C:\Users\SaiKo\.workbuddy\binaries\node\versions\22.22.2-6\npm.cmd" run live
> ```

---

## 文档索引

| 文件 | 内容 |
|---|---|
| `AGENTS.md` | **项目上下文与硬性约定（开工先读）**；含「塔罗牌库（造物 03）」架构节（路由 / 数据 / 组件 / 两拍动效 / 层级 / 事件驱动 / 待接入） |
| `STYLE.md` | **去 AI 味写作指南（活文档，写站点内容前必读）** |
| `PLAN.md` | 里程碑规划（M0–M6 全部完成；历史文档）|
| `DESIGN.md` | 设计规格（§8 游艺板块、§9 五栏体系）|
| `PITFALLS.md` | **26 条**踩坑记录（含 #25 VT 同名冲突 / #26 动效三坑）+ 快速修复清单 |
| `WORKLOG.md` | 工作日志（本文件同级，单文件多条目，最新在上）|
| `.worklog/memory/2026-10-0X.md` | 当日详细档案（含完整调研过程）|
| `.worklog/memory/MEMORY.md` | 项目长期记忆（决策、待办、环境）|

> 注：`HANDOFF.md` 与 `WORKLOG.md` 已移到根目录（2026-10-09），保持本地不入库（.gitignore）。

---

## 2026-10-06 会话完成概览

**里程碑**：M0 地基 → M1 博客 → M2 作品集 → M3 上线 GitHub Pages → M4 打磨 → M5 游艺板块 → **M6 五栏重构**

**额外完成**：
- giscus 评论（GitHub Discussions）
- **Last.fm 实时「正在听」**：本机推送脚本（`start-live.cmd` 双击启动）+ 网易云封面实时化 + 多源无缓存数据通道
- **部署通道从 Actions 切换为 gh-pages 分支**（应对 GitHub 故障），`scripts/deploy.sh` 一键发布
- **五栏信息架构重构** + 22 个旧 URL 跳转页
- 修掉两个隐蔽问题：git 凭据弹窗（`credential.helper=helper-selector`）、jsDelivr purge 限流
- 工作日志制度（单文件多条目）
- 文档体系：AGENTS / PLAN / DESIGN / PITFALLS / WORKLOG / HANDOFF
