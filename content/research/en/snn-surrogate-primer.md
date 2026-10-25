---
title: "Teaching Neurons to Fire: Surrogate Gradients and Spiking Networks in EEG Decoding"
date: "2026-10-25"
tags: [primer, spiking neural networks, neuromorphic computing, brain-computer interfaces]
summary: "Spikes are 0 or 1; gradients are continuous — once surrogate gradients bridge that gap, spiking networks overtake their ANN prototypes on EEG decoding."
---

## Why it exists

The bedrock of modern neural networks is backpropagation: every weight's contribution to the loss must be differentiable. Neurons in biology and in neuromorphic hardware work in another language — **spikes**. Membrane potential accumulates input; past the threshold it fires a 0/1 event, then resets. "Fire or not" is a step function whose derivative is zero almost everywhere, and backpropagation breaks down there. But spikes come with two reasons that are hard to refuse: **event-driven sparse computation** spends energy only when there is information — exactly the native computing style of memristive neuromorphic hardware — and **time becomes the carrier of information**, with signals encoded in instants and rhythms rather than amplitude alone.

## The minimal working principle

The core trick that makes spiking networks trainable is the **surrogate gradient**: the forward pass faithfully fires spikes with the step function (keeping the spike domain physically honest), while the backward pass "pretends" the step is a smooth sigmoid and passes the gradient through its continuous version. Discrete forward, continuous backward; the two coexist by convention — and training goes through.

The network's time dimension unfolds through **LIF (leaky integrate-and-fire) neurons**: membrane potential decays step by step with a leak coefficient, accumulates input current, and fires and resets upon crossing the threshold. The input — the same feature map — is injected repeatedly across T time steps, and the network learns on its own in the spike domain "what to accumulate and when to fire"; the output layer averages the spike counts over the T steps and feeds a linear classifier. On the BCI-IV 2a EEG decoding task, this pure-PyTorch spiking network, at a mean of 57.8% under 5-fold cross-validation, **beats its same-scale ANN prototype (52.5%) on all 9 subjects**, with the best subject above 82% and minimal fold-to-fold variation — the spike domain's feature representation suits this kind of nonstationary physiological signal remarkably well.

![LIF neuron dynamics: membrane potential accumulates, crosses threshold, fires, resets (Figure source: Neftci et al., IEEE SPM 2019, Fig. 1, arXiv:1901.09948)](/research/figures/t4_neftci_fig1.png)

## Common misconceptions

- "SNNs are harder to train, so they must be worse" — with surrogate gradients mature, right-sized SNNs often overtake: sparse temporal coding naturally matches transient signals.
- "Analog values must be Poisson-encoded into spikes" — injecting continuous current directly and letting the LIF do the "analog-to-spike" conversion itself is often simpler and more stable.
- "You need a dedicated SNN framework" — a twenty-line surrogate gradient function plus three LIF layers is enough to start (this repo is exactly that); frameworks become necessary only at scale.

## In my projects

[EEG decoding with spiking networks](/en/works/eeg-decoding-snn/) releases the complete implementation and protocol: ANN versus SNN on the same data, the same splits, and the same budget, with negative results (augmentation that didn't help, some subjects stuck at chance level) published alongside the positive ones. Together with the memristor QAT repo it forms the two ends of one question — spikes are the native language of memristive neuromorphic hardware, and quantization is the physical constraint the hardware must accept.

## Further reading

Search the keywords `surrogate gradient`, `spiking neural network EEG`, and `LIF neuron supervised training`; Neftci et al.'s surrogate gradient review is the recognized entry point to this line of work.
