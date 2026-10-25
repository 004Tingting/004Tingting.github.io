---
title: "Slicing Time into 72 ps: The Quantized-Delay Method and Coarse-Fine Counting in TDCs"
date: "2024-10-15"
tags: [primer, FPGA, time measurement]
summary: "What do you do when a stopwatch's ticks are too coarse? Turn the carry chain into a delay ruler ticked cell by cell, then pair coarse and fine counting to stretch the range to milliseconds — that is the whole secret of TDCs on FPGAs."
---

## Why it exists

Laser rangefinding, time-of-flight mass spectrometry, positron emission tomography — in the end they all do the same thing: measure how much time passes between two events, down to the picosecond scale. A generic stopwatch (counter) ticks in clock periods — on a 100 MHz board the tick is 10 ns, four orders of magnitude away from a picosecond. Raising the clock to picosecond rates is unrealistic, so the question becomes: **between two clock edges, can you draw a finer ruler of your own?**

## The minimal working principle

The FPGA already has this ruler lying around: the CARRY4 carry chain. It is a logic cell meant for addition carries, with one property instrument engineers borrowed — as a signal travels down the chain, each cell delays it by a nearly equal small time (a dozen-odd picoseconds per cell on the Artix-7). Feed the edge of the pulse to be measured into the chain, and place a "shutter" (latch) at every cell: when the clock edge arrives, the cell the signal has reached gets photographed. Count the lit cells and you have the "leftover" fraction of a clock period — this is the **quantized-delay method**: the delay chain provides fine ticks, clock counting provides coarse ticks, and the two combined give the full reading.

Two engineering details decide success or failure. The first is **encoding**: the raw output of 256 latches is a thermometer code (the first 130 cells lit, the rest dark) and must be converted to binary, while signal jitter punches "bubbles" into the middle of the lit region — the encoder has to tolerate and correct them. The second is **calibration**: the true delay of each cell is not strictly equal (this is differential nonlinearity, DNL), so the 72 ps cell width is not a design outcome — it is measured, by repeatedly timing a fixed interval and reading the cell width out of the statistics.

![Schematic of the quantized-delay method (drawn by the author)](/research/figures/t1_tdc_schematic.png)

![Operating principle of a TDC: delayed versions of the start signal are sampled on the rising edge of the stop signal, resulting in a thermometer code (Figure source: Henzler, Springer 2010, Fig. 2.9)](/research/figures/t1_henzler_fig2_9.png)

## Common misconceptions

- "Resolution is fixed by the process and cannot change" — simulating the same RTL on a higher-end device already reaches ~49 ps: cell width is a device propagation property, and device selection is a tuning knob.
- "Cells are 72 ps, so precision is 72 ps too" — take the standard deviation over many repeated measurements of a fixed interval and single-shot precision can beat the cell width (about 38.5 ps measured in this design): quantization noise and measurement noise are two different things.

## In my projects

[TDC-Bench](/en/works/fpga-tdc-carry4/) releases the RTL of this measurement chain, the analysis tooling, and 27 sets of raw characterization data: every number in this article — the 72 ps cells, the 38.5 ps single-shot precision, the linear tracking across 100 ps steps — can be recomputed from the raw data with one click.

## Further reading

Search the keywords `carry-chain TDC`, `wave union TDC`, and `code density test` to trace this line of work from principle to frontier; for the engineering, start directly from "lighting up cells" — get one cell to light first.
