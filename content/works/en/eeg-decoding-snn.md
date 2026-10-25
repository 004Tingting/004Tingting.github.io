---
title: "Spiking Networks Beat ANNs Across the Board in Motor-Imagery EEG Decoding: An Empirical SNN Study on BCI-IV 2a"
status: Research
period: "2026 — present"
tags: [brain-computer interfaces, spiking neural networks, deep learning, neuromorphic computing]
order: 3
summary: "EEGNet, DeepConvNet, and a self-implemented spiking network under one protocol — the spiking model wins on all 9 subjects (57.8% vs 52.5%), best subject 82.7%."
draft: false
---

> **One-minute background**: neuromorphic hardware computes with 0/1 spikes, while training depends on continuous gradients — surrogate gradients make the two compatible, and spiking networks become trainable like ordinary networks. Full explainer in Research: [“Teaching Neurons to Fire”](/en/research/snn-surrogate-primer/).

Motor-imagery EEG decoding is a standard benchmark for brain-computer interfaces. On the public BCI Competition IV-2a dataset (9 subjects, four motor-imagery classes, 288 trials per subject), this project compares three decoders under one protocol: EEGNet, DeepConvNet, and a self-implemented spiking network, SpikingEEGNet — convolutional features feed a stack of leaky integrate-and-fire (LIF) neurons trained with surrogate gradients over 8 time steps, in pure PyTorch with no SNN framework.

Under the literature-standard 5-fold stratified cross-validation (all trials used), the result is unexpectedly one-sided: the spiking network beats EEGNet on mean accuracy, 57.8% ± 19.3 vs 52.5% ± 17.7, and leads on every one of the 9 subjects individually (largest gap +12.6 pt); the best subjects reach 82.7% ± 3.2 and 82.3% ± 1.3, the latter with fold-to-fold variation of only ±1.3%. The ablation records keep the versions that did not work — the augmentation attempts and the learning-rate retuning — published alongside the positive results.

Spiking-domain computation is the native computing style of memristive in-memory hardware: together with [memristor-qat-cim-sim](https://github.com/004Tingting/memristor-qat-cim-sim) (the empirical study of quantization-aware training), this repo forms the two ends of one question — what low-precision, non-ideal computing means for model training and signal encoding. Training infrastructure is AMD DirectML; all results are reproducible.

Repo: [eeg-decoding-snn](https://github.com/004Tingting/eeg-decoding-snn)
