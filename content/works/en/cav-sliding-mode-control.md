---
title: Sliding Mode Control for CAVs
status: Research
period: "2025 — present"
tags: [control theory, research]
order: 1
summary: Finite-time and predefined-time sliding mode control for connected autonomous vehicles — with a convergence bound you can set in advance.
draft: false
---

## The Problem

In cooperative control of connected autonomous vehicles (CAVs), convergence speed and steady-state accuracy pull against each other. Finite-time control gives an upper bound on settling time — but the bound depends on initial conditions and cannot be promised in advance. Predefined-time control fixes that, at the cost of singular terms and stronger chattering.

## Approach

Working along the predefined-time terminal sliding mode line: a nonsingular terminal sliding surface that drives the state to converge within a preset bound, plus a matched robust term for lumped disturbances to suppress chattering and steady-state error.

## Progress

- Mapped the lineage: finite-time → fixed-time → predefined-time sliding mode control
- Reproduced the nonsingular predefined-time terminal sliding mode control from Deng et al. (2024); verified convergence behavior in simulation
- Next: adapt to CAV platooning with constrained communication
