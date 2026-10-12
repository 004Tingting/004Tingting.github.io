---
title: 用延迟反馈「预订」收敛时刻：Deng et al. 2024 论文精读笔记
date: "2026-10-12"
tags: [控制理论, 滑模控制, 预定时间控制, 论文笔记]
summary: Deng 等 2024 年发表于 IEEE TAC 的论文精读，用带人工时延的平滑滑模面构造非奇异预定时间终端滑模控制，附对 CAV 场景的适用性分析。
---

> Yang Deng, Emmanuel Moulay, Vincent Léchappé, Zhang Chen, Bin Liang, Franck Plestan. *Robust Nonsingular Predefined-Time Terminal Sliding Mode Control for Perturbed Chains of Integrators*. IEEE Transactions on Automatic Control, 69(12): 8946–8953, 2024. DOI: [10.1109/TAC.2024.3426554](https://doi.org/10.1109/TAC.2024.3426554)，作者自存版全文见 [hal.science/hal-04637935](https://hal.science/hal-04637935)。作者单位：清华大学自动化系（Deng、Chen、Liang，Chen 为通信作者）、普瓦捷大学 XLIM（Moulay）、里昂 INSA / Ampère（Léchappé）、南特大学 LS2N（Plestan）；国家自然科学基金 62203252、62073183 资助。

## 一、这篇文章在解决什么

终端滑模控制（TSMC）的卖点有两个：到达滑模面之后对匹配扰动的不变性，以及有限时间收敛。这几年大家不满足于「有限」，进一步追求固定时间（fixed-time）：收敛时间上界与初值无关（Polyakov，2012）。但固定时间 TSMC 有个老毛病——奇异：经典终端滑模面在状态趋近原点时控制量发散。已有的非奇异固定时间 TSMC（Zuo 2015 起的一大批）有两个通病：

1. 消奇异基本靠切换，要么切换滑模面，要么切换控制律；
2. 绝大多数只做到双积分器或二阶系统，高阶积分链没人系统处理。

Pal 等（2022）和 Chen 等（2022）用时间缩放与变增益绕开了切换，做出无切换的非奇异预定时间 TSMC，但只覆盖匹配扰动。另一条线索是 Zhou、Michiels 与 Chen（2021）的平滑周期延迟反馈：用人工延迟实现固定时间收敛，形式很光滑，代价是其原文注记 4 明说的鲁棒性缺陷——按那套方法设计的反馈控制器，在扰动或模型不确定下保不住预定时间稳定性。

本文把两条线接起来：借延迟反馈的形式构造滑模面，鲁棒性仍交给滑模控制理论。成品同时满足四件事：非奇异、不靠切换、匹配与失配扰动都覆盖、从双积分器推广到 n 阶积分链。

这里先把口径说清。预定时间（predefined-time）指用户先指定收敛时刻 T_c，控制器参数按 T_c 整定，收敛不迟于 T_c；它和固定时间的区别是上界由用户指定而非由参数间接决定。文中还有一级更严的定义，所有非零初值恰在 T_c 这一刻收敛，论文称 prescribed-time，本文保留英文。

## 二、核心思路：把收敛时刻编进增益的开关时刻

全文的积木是一个带人工延迟的标量系统（Lemma 3）：

```
ζ'(t) = a·ζ(t) − K(t)·ζ(t−h)
```

增益 K(t) 不是常数，而是支撑在 [h, 2h] 窗口内的光滑 bump，再按 W 归一化：

```
K(t) = R(t)·e^(a·h)·W·e^(−2a·t)

R(t) = 0                        , t ∈ (−∞, h) ∪ [2h, ∞)
R(t) = M − (t−h)·(2h−t)         , t ∈ [h, 2h]     （M > 1，形状示意，端点处取零）

W = ∫[h→2h] R(θ)·e^(−2aθ) dθ    （按 a 离线算出，恒正）
```

结论：只要 ζ(0) ≠ 0，ζ(t) 就在 t = 2h 这一刻精确归零，之后 K 恒为零，零点保持。

证明骨架值得在脑子里过一遍，它解释了「精确时刻」从哪来：

- t ∈ [0, h)：K ≡ 0，系统退化为线性 ζ' = a·ζ，解为 ζ(t) = e^(a·t)·ζ(0)；
- t ∈ [h, 2h]：延迟项激活，解的形状是 e^(a·(t−h))·[1 − (1/W)·∫[h→t] R(θ)·e^(−2aθ) dθ]·W·ζ(0)。方括号里的积分被积函数恒正、单调递增，凭 W 的定义恰好积到 1，所以方括号从 0 涨到 1，在 t = 2h 精确到零；
- t ≥ 2h：K 又恒为零，ζ' = a·ζ 而 ζ(2h) = 0，零点被保持。

三点观察：

1. 「精确时刻」是 W 的归一化积分造出来的，不是渐近逼近，这是预定时间区别于固定时间的本质；
2. 结论对任意 a ∈ R 成立，a 的符号只影响中间过程的形状，不影响收敛时刻；
3. 延迟量 h 是滑模面的调参参数，不是被控对象的物理时延，论文对此有专门说明。实现上需要在 [0, 2h] 段缓冲一段状态历史，但 h 是设计者选的小参数（仿真里取 0.5 s 和 0.75 s），缓冲成本可以忽略。

鲁棒性从哪来？这是全文最巧的一刀：延迟反馈只出现在滑模面里。滑模面是人为定义的几何，不受扰动影响、不依赖模型；扰动只能通过到达段进入闭环，而到达段用的是 Moulay 等（2022）的鲁棒固定时间项。职责分离——滑模面负责何时收敛，到达项负责扰动下也到得了，谁都不必替对方背书。Zhou 等人那套延迟反馈的鲁棒性缺陷，就这样被绕开了。

## 三、数学结构

### 3.1 四种稳定性

| 稳定性 | 判据 | 上界依赖初值 | 上界是参数的显式函数 |
|---|---|---|---|
| 有限时间 | 存在 T_c(x0) | 是 | 否 |
| 固定时间 | T_c(x0) ≤ T_c，T_c 为常数 | 否 | 间接 |
| 预定时间 | 用户先定 T_c，收敛不迟于 T_c | 否 | 是 |
| 规定时刻（prescribed-time） | 非零初值都恰在 T_c 收敛 | 否 | 是 |

后两者的区别是本文暗线：主要定理给的大多是「不迟于 T_c」，Proposition 1 才升级成「恰在 T_c」。

### 3.2 双积分器：三段时间线

对象是受扰双积分器：

```
x1' = x2
x2' = u + d          |d| ≤ δ
```

滑模面（17 式）在线性面 x2 − a·x1 上追加一项延迟反馈：

```
s(t) = x2(t) − (a·x1(t) − K'(t)·x1(t−h))        其中 K'(t) = K(t−h)
```

控制律（19 式）等于等效控制加鲁棒到达项：

```
u(t)  = ueq(t) + uF(t)
ueq(t) = a·x2(t) − K̇'(t)·x1(t−h) − K'(t)·x2(t−h)
uF(t)  = −k·|s|^(λ·s²/(1+μ·s²))·sgn(s)
```

uF 取自 Moulay 等（2022）：指数 λ·s²/(1+μ·s²) 随 |s| 增大从 0 单调升到 λ/μ，原点附近项幅值不超过 k（有界，不发散），远处按 |s|^(λ/μ) 幂次增长（强力）。非奇异性和鲁棒到达这一半靠它；参数 λ, μ > 0，k 按论文 (6) 式取充分大，保证 s 在预设时刻 h 之前归零。

把 K'(t) 的开关时刻画出来，闭环是三段结构，h = T_c/3：

| 时段 | K'(t) | 滑模面 | 动力学 | 归零时刻 |
|---|---|---|---|---|
| [0, h) | 0 | s = x2 − a·x1 | 到达段，s' = uF + d | s 不迟于 h |
| [h, 2h) | 0 | s = x2 − a·x1 | 滑模段，x1' = a·x1 | — |
| (2h, 3h) | 激活 | s = x2 − a·x1 + K'·x1(t−h) | 滑模段，x1' = a·x1 − K'·x1(t−h) | x1 在 3h |
| ≥ 3h | 0 | s = x2 − a·x1 | 由 uF 维持 | 保持 |

- 第一段：K' ≡ 0，滑模面退化成线性面，到达动力学正是 Lemma 1（即 Moulay 2022）的形式；
- 第二段：K'(t) = K(t−h) 要 t > 2h 才非零，滑模段是纯线性；
- 第三段：延迟增益激活，滑模段动力学恰是 Lemma 3 平移 h 的形式，x1 在 t = 3h 精确归零；s ≡ 0 与 x1 ≡ 0 合起来逼出 x2 ≡ 0。

Theorem 1：整机鲁棒预定时间稳定于 t = 3h，h 调小即缩短收敛时刻。

暗礁有两个。其一，如果轨迹恰好在原点处到达滑模面（论文 Case 1），x1(h) = 0，延迟段从零初值启动，Lemma 3 的「精确时刻」无从谈起，只能保证不迟于 3h。Proposition 1 给出补丁：按初值选 a，x1(0) ≠ 0 时取 a = x2(0)/x1(0)，否则取 0，保证 x1(h) ≠ 0，升级成规定时刻收敛。其二，Remark 3 提醒：a > 0 时稳态滑模面 x2 − a·x1 = 0 本身不稳定（滑模段 x1' = a·x1 发散），理论上状态已到原点所以无碍，数值实现建议 3h 后把 a 切成负值。

非奇异性的证明分两半：uF 的有界性来自 Moulay 2022 的结果；ueq 里出现 K̇'（增益的导数），靠 Lemma 4 保证 K' 及各阶导数全局有界。全程无切换、无分数幂奇性。

### 3.3 积分链：把三段时间线级联

对 n 阶受扰积分链（x_i' = x_(i+1)，i < n；x_n' = u + d），滑模面递归定义：

```
s0 = x1
si(t) = s(i−1)'(t) − (a·s(i−1)(t) − Ki(t)·s(i−1)(t−h))      i = 1…n−1
Ki(t) = K(t − (2n−2i−1)·h)
```

每个面的增益窗口比上一层再晚 2h，形成瀑布：s(n−1) 靠到达项在 h 前归零，s(n−2) 在 3h，s(i) 在 (2n−2i−1)·h，整条链在 (2n−1)·h。控制律（29 式）是等效控制加同一个 uF，代价是要用到 s(i−1) 的各阶导数，按（28 式）的组合数展开显式算出。Theorem 2：闭环鲁棒预定时间稳定于 t = (2n−1)·h，双积分器就是 n = 2。

### 3.4 失配扰动：收敛不到原点了

失配情形（x_i' = x_(i+1) + d_i，i < n）下，论文先用 Moreno（2021）的任意阶固定时间微分器搭一串扰动观测器（Assumption 1：失配扰动各阶导数有界，匹配扰动有界），要求观测器收敛时间 T_O ≤ h；再用观测值重构 s0 的各阶导数，滑模面形式不变、增益窗口整体后移（Ki(t) = K(t − 2(n−i)·h)）。Theorem 3：s(i) 在 2(n−i)·h 归零，但闭环收敛到的是扰动相容的平衡轨迹：

```
(x1, x2, …, xn) → (0, −d1, −d1' − d2, …, −Σ[i=1→n−1] d_i^(n−i−1))
```

而不是原点。这是失配扰动下的固有边界：扰动不在输入通道里，控制再强也只能把状态稳到让扰动与动态自洽的那条轨迹上。对 CAV 这类实际场景，这个结论比「收敛到原点」更诚实。

## 四、仿真

双积分器：h = 0.5 s，T_c = 1.5 s，d = 1.5 + sin(2t)，δ = 2.5，k = 18，λ = 3，μ = 1.2，M = 1.00001，W 离线算出。

- 初值 (1, −2)：a = −2，轨迹一开始就躺在线性面上，x1(h) = e^(a·h)·x1(0) = 0.368 ≠ 0，精确在 1.5 s 归零；
- 初值 (0, 2)：a = 0，相轨迹顺时针转到 x1 轴上的 (0.083, 0)，x1(h) ≠ 0，同样精确收敛；
- 初值 (1, 0.2)：a = 0.2 > 0，精确收敛后按 Remark 3 把 a 切成 −1，之后轨迹贴住原点；
- Fig 2b：不同初值下状态范数都在 t = 1.5 s 精确触零。

三积分器：h = 0.75 s，a = −3，k = 22，λ = 5，μ = 3，观测器 T_O = 0.65 s ≤ h；d1 = 0.5 + 0.5·sin(2t)，d2 = 1 + 0.2·sin(10t)，d3 = 1 + cos(2t)，δ = 2。

- s2 在 2h = 1.5 s 前归零，s1、s0 依次在 4h = 3.0 s 和 6h = 4.5 s；
- 状态在 t = 6h = 4.5 s 前收敛到 (0, −d1, −d1' − d2)；
- 第二组实验把初值放大 10¹ 到 10⁴ 倍，误差范数照样在 6h 前归零，直观验证预定时间性对初值不敏感。

## 五、评价与待验证

加分项：

- 非奇异不靠切换，滑模面全程光滑，控制律幅值有界；
- 从双积分器一步推到 n 阶积分链，结构统一：级联滑模面加增益窗口顺延；
- 匹配、失配扰动都覆盖，失配部分自带扰动观测器；
- 「延迟反馈只进滑模面」这一刀，既拿到预定时间，又绕开延迟反馈的鲁棒性缺陷；
- 收敛时刻成为显式设计参数：T_c = (2n−1)·h（失配时 2n·h），想快就调小 h。

代价与局限，以下是我读时的笔记，留待复现时核对：

- 控制律需要滑模变量的高阶导数（到 n−1 阶）和增益的各阶导数，前者要求状态测量干净，后者可离线算；
- 人工延迟要一段长度为 h 的状态缓冲；h 调小缓冲变短，但 K̇' 在控制律里变大，整定时得留神；
- a 的选取精细：Proposition 1 的 a 依赖初值，属开环整定；Remark 3 又要求收敛后切换符号，闭环里怎么平滑地做，论文没给答案；
- 持续扰动下，连续到达项意味着滑模面附近是边界层而非精确不变；论文所述 t ≥ 3h 后 s ≡ 0 是理想滑模意义下的表述；
- 扰动假设不轻：匹配要有界，失配还要求各阶导数有界；
- 只有仿真，实验验证和非线性三角系统都被作者列为 future work，而 CAV 纵向动力学恰恰是三角结构，直接套用还差一步。

对 CAV 的联系：纵向碰撞避免与编队控制常把相对动力学约成双积分器或三积分器（位置、速度、加速度链，外加未知阻力与质量扰动），预定时间收敛让「编队何时重新收敛」变成可设计量，比固定时间的「反正有个上界」更贴合有时限要求的场景，比如汇入冲突点和绿灯窗口。要往自己的课题上搬，最小的一步是复现三积分器失配组，把 d 换成车速相关的阻力项，看 T_c = 6h 的整定和 T_O ≤ h 的约束在真实采样率下是否还成立。

待办清单：

- 复现 Lemma 3 标量系统，换不同的 a 和 M，验证精确时刻与初值无关
- 复现 Fig 2 三组初值，重点看 Case 2 的相轨迹
- 复现 Fig 3 三积分器失配组，核对观测器 T_O ≤ h 的必要性
- 验证 Remark 3：a > 0 且不切换时，3h 之后的数值表现
- 检查持续扰动下的边界层宽度与 k 的关系
- 读 Zhou 等（2021）原文的注记 4，确认延迟反馈鲁棒性缺陷的准确边界

## 参考文献（主要几篇）

- Deng Y, Moulay E, Léchappé V, Chen Z, Liang B, Plestan F. Robust nonsingular predefined-time terminal sliding mode control for perturbed chains of integrators. IEEE TAC, 69(12): 8946–8953, 2024.
- Polyakov A. Nonlinear feedback design for fixed-time stabilization of linear control systems. IEEE TAC, 57(8): 2106–2110, 2012.
- Bhat S P, Bernstein D S. Finite-time stability of continuous autonomous systems. SIAM J. Control Optim., 38(3): 751–766, 2000.
- Aldana-López R, Seeber R, Gómez-Gutiérrez M, Angulo M T, Defoort M. A redesign methodology generating predefined-time differentiators with bounded time-varying gains. Int. J. Robust Nonlinear Control, 2022.
- Zhou B, Michiels W, Chen J. Fixed-time stabilization of linear delay systems by smooth periodic delayed feedback. IEEE TAC, 67(2): 557–573, 2021.
- Moulay E, Léchappé V, Bernuau E, Plestan F. Robust fixed-time stability: application to sliding mode control. IEEE TAC, 67(2): 1061–1066, 2022.
- Moreno J A. Arbitrary-order fixed-time differentiators. IEEE TAC, 67(3): 1543–1549, 2021.
- Pal A K, Kamal S, Yu X, Nagar S K, Bandyopadhyay B. Free-will arbitrary time terminal sliding mode control. IEEE TCAS-II, 69(7): 3189–3193, 2022.
- Chen Z, Ju X, Wang Z, Li Q. The prescribed time sliding mode control for attitude tracking of spacecraft. Asian J. Control, 24(4): 1650–1662, 2022.
- Zuo Z. Non-singular fixed-time terminal sliding mode control of non-linear systems. IET Control Theory Appl., 9(4): 545–552, 2015.
