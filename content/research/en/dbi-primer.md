---
title: "Two 5 GHz Halves Make One 10 GHz Whole: Bandwidth Interleaving and the Overlap-Band Notch"
date: "2024-09-15"
tags: [primer, signal processing, oscilloscopes, bandwidth interleaving]
summary: "One ADC can't capture 10 GHz, so use two, each capturing half, then stitch — the hard part is not the split but the notch tens of dB deep at the seam: where it comes from and how to remove it."
---

## Why it exists

An oscilloscope's end-to-end bandwidth is boxed in by three things: the front-end amplifier, the sampler, and the ADC. Devices' analog bandwidth creeps up a little each year while the specs double — a 40–80 GSa/s instrument cannot wait for the devices. Bandwidth interleaving (DBI) divides and conquers: a filter bank splits the 0–10 GHz input into two subbands (0–5.5 GHz passes straight through; 5.5–10 GHz is shifted to an intermediate frequency by an LO), each subband is acquired by an ADC good enough for its half, and the digital domain moves both subbands back into place and reassembles the full wideband signal.

## The minimal working principle

"Splitting" is easy; "stitching" is hard. The two subbands must overlap across 5–6 GHz — inside this **overlap band**, the same frequency content exists in both paths, and reconstruction cross-blends them with cosine weights. Ideally the two paths match exactly in amplitude and phase there, and the blend is lossless; in reality there is always some **transport delay difference** between the paths plus the **nonlinear group delay** left by the front-end filters. In the overlap band the delay difference shows up as a phase difference that grows linearly with frequency: the blend reinforces in phase and cancels out of phase — and right at the center of the overlap band, at the moment of exact antiphase, a **cancellation notch** tens of dB deep appears. The oscilloscope's magnitude response caves in there, and any signal passing through that band is distorted.

Calibration therefore runs in three stages. First, wideband correlation (or timestamps) measures the integer and fractional delay differences between the paths, and a FIFO plus a fractional-delay FIR aligns them. Then a parametric all-pass filter flattens the group-delay hump at the overlap band — note that an all-pass's phase can only fall monotonically, so the hump can only be "added" to the phase-advanced path, not "subtracted" from the lagging one. Finally the paths are blended by the overlap weights. After calibration, this simulation pulls the notch from −7 dB to within 0.01 dB, with 0.06 dB passband ripple.

![M-channel FIADC block diagram (Figure source: Zhao Yu, UESTC doctoral dissertation, Fig. 1-4)](/research/figures/t2_zhao_fig1_4.png)

![Analog signal-conditioning front end of the BI-DAQ system (Figure source: Zhao Yu, UESTC doctoral dissertation, Fig. 6-2)](/research/figures/t2_zhao_fig6_2.png)

## Common misconceptions

- "Matching the two paths' gains is enough" — the notch is a phase phenomenon; identical gains cannot save it.
- "One number is enough to calibrate the delay difference" — group-delay distortion varies with frequency; the residual nonlinear part must be handed to all-pass equalization.
- "Calibrate once, valid forever" — temperature and device aging drift; real instruments recalibrate periodically.

## In my projects

[The DBI digital reconstruction simulation](/en/works/dbi-reconstruction-sim/) verifies every stage of this three-stage calibration chain on synthetic signals, and provides notch-depth-versus-mismatch curves, a CORDIC precision analysis, and a swept-frequency reconstruction demo — the method matches the overlap-band compensation structure in the dissertation, kept as a reference for later RTL work.

## Further reading

Search the keywords `bandwidth interleaving`, `crossband calibration`, and `dual-channel time-interleaved ADC`; Zhao Yu's dissertation *Research on Ultra-Wideband Data Acquisition Methods Based on Bandwidth Interleaving* (UESTC) treats this project's architecture and its boundary-condition derivation systematically.
