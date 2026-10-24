---
title: 脉冲网络在运动想象脑电解码上全面胜过 ANN：BCI-IV 2a 上的 SNN 实证
status: 研究方向
period: "2026 —"
tags: [脑机接口, 脉冲神经网络, 深度学习, 类脑计算]
order: 3
summary: EEGNet、DeepConvNet 与自实现脉冲网络在同一协议下对比——脉冲模型在全部 9 名被试上胜出（57.8% vs 52.5%），最佳被试 82.7%。
draft: false
---

> **一分钟背景**：类脑硬件用 0/1 脉冲计算，而训练依赖连续梯度——代理梯度让两者兼容，脉冲网络由此可以像普通网络一样训练。完整讲解见研思[《让神经元学会发放》](/research/snn-surrogate-primer/)。

运动想象脑电（EEG）解码是脑机接口的标准基准。本项目在 BCI Competition
IV-2a 公开数据集（9 名被试、四类运动想象、288 试次/人）上，以同一协议对比
三式解码器：EEGNet、DeepConvNet，以及自实现的脉冲网络 SpikingEEGNet——
卷积特征送入漏积分发放（LIF）神经元栈，以代理梯度在 8 个时间步上训练，
纯 PyTorch 实现而不依赖任何 SNN 框架。

在文献标准的 5 折分层交叉验证下（用满全部试次），结果出乎预料地一边倒：
脉冲网络以 57.8% ± 19.3 的均值胜过 EEGNet 的 52.5% ± 17.7，且在全部 9 名
被试上逐一占优（最大差距 +12.6 pt）；最佳被试达到 82.7% ± 3.2 与
82.3% ± 1.3，后者的折间波动仅 ±1.3%。消融记录显示增强与学习率调整的无效
版本同样被保留——负结果与正结果一并发布。

脉冲域计算正是忆阻存内硬件的原生计算风格：本仓库与
[memristor-qat-cim-sim](https://github.com/004Tingting/memristor-qat-cim-sim)
（量化感知训练的实证）构成同一问题的两端——低精度、非理想计算对模型训练
与信号编码意味着什么。训练基础设施为 AMD DirectML，全部结果可复现。

仓库：[eeg-decoding-snn](https://github.com/004Tingting/eeg-decoding-snn)
