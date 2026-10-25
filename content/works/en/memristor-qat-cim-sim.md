---
title: "Quantization-Aware Training for Memristive In-Memory Computing: Evidence for the 4-bit Plateau and Robustness to Device Non-idealities"
status: Replication
period: "2024 — 2025"
tags: [in-memory computing, memristors, quantization-aware training, PyTorch]
order: 4
summary: "An independent reproduction of quantization-aware on-chip training — 4-bit quantization nearly lossless, ADC resolution halvable, training robust to 10% programming noise; every claim re-run from the repo's own code."
draft: false
---

> **One-minute background**: squeeze a neural network into analog hardware and the weights are left with 4 bits and noise — quantization-aware training (QAT) makes the network live inside those constraints during training, not after. Full explainer in Research: [“Why 4-bit Doesn't Lose Accuracy”](/en/research/qat-memristor-primer/).

Memristive in-memory computing (CIM) performs matrix multiplication in the analog domain via Kirchhoff's current law, but the devices' low precision and non-idealities (conductance drift, programming noise, mapping errors) put "high-precision training" and "low-precision inference" in direct conflict. Quantization-aware training (QAT) is the representative answer to that conflict.

This repo is an independent reproduction and methods release of that line of work: straight-through estimator (STE) quantization, device-level non-idealities injected on every forward pass, and a partial-sum (ADC) quantization model grouped in 128-column tiles — all run on MNIST under one protocol. Three core findings. First, 4-bit weight/activation quantization with device non-idealities on top reaches 98.47% accuracy, level with the floating-point baseline (98.19%) — the non-ideality injection turns out to act as a regularizer. Second, accuracy responds to bit width with a wide plateau rather than a cliff: nearly lossless from 8-bit down to 4-bit, with the collapse at 3-bit. Third, partial-sum ADC resolution can drop from 8-bit to 4-bit at a cost under 1 pt, and the 4-bit QAT model loses only about 0.4 pt under 10% programming noise.

Every finding is reproduced by the repo's code under fixed seeds — same release principle as TDC-Bench: the numbers must be re-runnable from the repository itself.

Repo: [memristor-qat-cim-sim](https://github.com/004Tingting/memristor-qat-cim-sim)
