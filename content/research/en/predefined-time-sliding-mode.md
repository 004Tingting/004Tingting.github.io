---
title: "Predefined-Time Sliding Mode Control: Making Settling Time a Design Variable"
date: "2026-10-06"
tags: [control theory, sliding mode, CAV]
summary: Three paradigms for characterising settling time — finite time, fixed time, predefined time — and the basic approaches to avoiding singularity.
---

> Sample article — keep the structure, replace with your own reading notes.

## Motivation

The core promise of sliding mode control is invariance: once the state reaches the sliding surface, the subsequent motion is insensitive to matched uncertainty. But *how fast* it gets there has long been a by-product rather than a design objective — which is not good enough in deadline-sensitive settings such as CAV platooning.

## Three ways to characterise settling time

| Paradigm | Time bound | Depends on initial state | Prescribable |
|---|---|---|---|
| Finite time | Exists, but tangled with initial conditions | Yes | No |
| Fixed time | A constant independent of initial state | No | No (indirect, via parameters) |
| Predefined time | Explicit function of controller parameters | No | **Yes** |

The key of predefined-time control is the last row: writing the bound as an explicit function `T_c` lets you choose the time first and tune parameters afterwards — the tuning loop now has a concrete target.

## Two routes to nonsingularity

The classic problem with terminal sliding mode is singularity: the control input blows up as the state approaches the origin. Standard treatments:

1. **Indirect**: design a nonsingular terminal sliding surface, avoiding the singular term on the surface;
2. **Switching**: use terminal sliding mode away from the origin, switching to linear sliding mode near it.

The former is structurally more uniform, at the cost of a more involved surface design.

## To read and to verify

- The nonsingular predefined-time terminal sliding mode design in Deng et al. (2024), especially how the bound is constructed
- Simulation: comparing actual reaching times across the three paradigms under identical initial perturbations
