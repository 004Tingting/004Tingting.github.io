---
title: "Digital Reconstruction Chain for a 40–80 GSa/s Oscilloscope: A Python Methodology Simulation of Dual-Subband Interleaved Acquisition"
status: Engineering
period: "2023 — 2024"
tags: [signal processing, oscilloscopes, bandwidth interleaving, Python]
order: 6
summary: "A digital bandwidth-interleaving (DBI) architecture for an ultra-high-speed oscilloscope front end — the whole chain of 'subband split → digital upconversion → overlap-band calibration → recombination' validated to 0.06 dB on synthetic signals."
draft: false
---

> **One-minute background**: when one ADC can't capture 10 GHz, split the input into two overlapping subbands, acquire each, and recombine in the digital domain — the hard part is the seam, where phase mismatch between the two paths leaves a deep notch. Full explainer in Research: [“Two 5 GHz Halves Make One 10 GHz Whole”](/en/research/dbi-primer/).

When ADC devices' analog bandwidth and sample rate fall short of the instrument spec, bandwidth interleaving (DBI) is the classic way for an oscilloscope front end to double its effective bandwidth: split the 0–10 GHz input into two overlapping subbands, downconvert and acquire each, then reconstruct in the digital domain. The difficulty has never been the stitching itself but the overlap band — group-delay distortion and phase mismatch between the two paths leave a cancellation notch tens of dB deep at the seam.

This project validates the entire digital reconstruction chain in Python as a methodology study: front-end subband splitting and LO downconversion, a damage model covering group-delay distortion / transport delay / gain ripple, a CORDIC numerically controlled oscillator, wideband correlation delay estimation, a 48-tap Kaiser sinc fractional-delay FIR, overlap-band phase alignment, and raised-cosine overlap recombination. Measured results: after calibration the overlap-band response is −0.03…+0.02 dB (uncalibrated notch −7.1 dB) and overall passband ripple is 0.06 dB — better than the 0.33 dB of the parametric all-pass compensation structure in the reference literature, because this implementation corrects each measured frequency point exactly while the reference uses a parametric approximation; the documentation states this distinction as-is.

Debugging confirmed three easily missed implementation points (the CORDIC gain constant and its ±1.743 rad convergence range, the periodic ambiguity of multi-tone comb correlation, and a single-section all-pass's inability to fit a hump-shaped phase error), all documented in the repo.

Repo: [dbi-reconstruction-sim](https://github.com/004Tingting/dbi-reconstruction-sim)
