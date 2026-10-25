---
title: "TDC-Bench: Measuring and Characterizing a CARRY4 Delay-Line Time-to-Digital Converter"
status: Engineering
period: "2024"
tags: [FPGA, time measurement, instrumentation, characterization]
order: 5
summary: "An FPGA tapped-delay-line TDC with 72 ps resolution, plus 27 sets of measured data and a complete analysis pipeline — every number can be recomputed from the raw data."
draft: false
---

> **One-minute background**: oscilloscopes and laser rangefinders need picosecond-scale time intervals, while a digital clock's ticks are nanosecond-wide — a TDC (time-to-digital converter) uses an FPGA carry chain as a ruler with fine ticks and counts out the leftover fraction of a clock period. Full explainer in Research: [“Slicing Time into 72 ps”](/en/research/tdc-primer/).

Time-interval measurement sits at the core of laser rangefinders and time-of-flight instruments. TDC-Bench is the time-measurement subsystem of a laboratory instrument-development project: a TDC based on the quantized-delay method on a Xilinx Artix-7, with a 200-tap delay chain built from CARRY4 carry primitives as the fine-time quantizing unit, plus a latch-to-binary encoder and an 8-bit coarse counter chain (50 × 72 ps = 3.6 ns per tick), extending the unambiguous range to the sub-millisecond scale.

This release covers the subsystem's characterization: the RTL of the FPGA measurement chain, tooling for analyzing the acquired data (the original MATLAB flow plus a Python reproduction), and 27 sets of raw acquisitions at fixed intervals (about 4.4k–5.2k measurements per set, input intervals stepped by 100 ps). Measured results: bin resolution 72 ps; single-shot precision about 38.5 ps (std/√2, median over the 27 sets); means track the input steps linearly. The gap between the 50 ps design target and the measured 72 ps, and the comparison against higher-end devices, are documented as-is.

Every published number can be recomputed from the raw data in the repo with one click — that is this repo's release principle.

Repo: [fpga-tdc-carry4](https://github.com/004Tingting/fpga-tdc-carry4)
