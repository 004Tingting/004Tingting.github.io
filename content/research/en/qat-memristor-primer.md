---
title: "Why 4-bit Doesn't Lose Accuracy: Quantization-Aware Training and Device Non-idealities"
date: "2025-01-15"
tags: [primer, in-memory computing, memristors, quantization-aware training]
summary: "Stuff a neural network into analog hardware and the weights drop to 4 bits with noise always lurking — QAT's answer: don't face the hardware after training ends; live inside it during training."
---

## Why it exists

Memristive in-memory computing (CIM) completes matrix multiplication in the analog domain with Kirchhoff's current law: weights are stored as conductances in the device array, inputs are applied as voltages, and the summed current is the multiply-accumulate. The move buys one to two orders of magnitude in energy efficiency; the price is that weights are no longer 32-bit floats but **an analog device** — a finite number of bits, and values that drift, jitter, and skew when read out. The traditional route of training in floating point in the cloud and compressing onto the hardware at deployment often loses accuracy heavily at the moment of deployment.

## The minimal working principle

Quantization-aware training (QAT) takes a clear stance: don't face the hardware after training ends — live inside it during training. On every forward pass, weights and activations are "pretend" quantized to the target width (say 4 bits); backpropagation routes around quantization's non-differentiability — a differentiable function delivers the gradient on behalf of the non-differentiable staircase. That is the **straight-through estimator (STE)**. The network spends training repeatedly adapting to the fact "I only have 4 bits", and the weights it finally learns still hold at low precision.

Device non-idealities are injected during training too: programming noise gives each write a small random offset, conductance drift decays written values over time, and differential calibration leaves the positive/negative conductance pairs not perfectly symmetric. The interesting part: "a fresh set of noise on every forward pass" is effectively a joint perturbation of data and parameters, and **acts as a regularizer** — in this repo's runs, the 4-bit QAT model with non-idealities stacked on (98.47%) actually lands slightly above the floating-point baseline (98.19%).

The third stage is the ADC: the crossbar array's current-summed result must pass through analog-to-digital conversion to return to the digital domain, and the ADC's bit width directly sets power and area. Experiments show a **plateau** in the resolution of partial sums: dropping from 8-bit to 4-bit is nearly lossless, and the collapse happens at 3 bits — finding the edge of the plateau is finding where power gets cut in half.

![The simulated quantization step in quantization-aware training (Figure source: Jacob et al., CVPR 2018, Fig. 1.1)](/research/figures/t3_jacob_fig1_1.png)

## Common misconceptions

- "Accuracy loss from quantization is inevitable" — the loss happens when you quantize after training; be present during training and 4-bit can be near-lossless (in this repo, 4-bit sits on a wide plateau).
- "Device noise is the enemy" — during training it is a regularizer; at inference it is the enemy. The two must be measured in separate experiments.
- "STE isn't accurate enough" — STE is a biased but practical estimate; with a proper learning rate and gradient clipping it converges to parity with floating point.

## In my projects

[The memristor QAT study](/en/works/memristor-qat-cim-sim/) provides fully reproducible experiments for all three stages: bit-width sweeps, non-ideality strength sweeps, ADC resolution sweeps, and the "near-lossless down to 4-bit" conclusion — every number produced by the repo's code under fixed seeds.

## Further reading

Search the keywords `quantization-aware training`, `memristor crossbar training`, and `in-memory computing analog noise`; Jacob et al. (CVPR 2018) and Yao et al. (Nature 2020) are the landmark references for quantization methods and for full hardware implementation, respectively.
